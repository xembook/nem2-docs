/*
 *
 * Copyright 2018-present NEM
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import {
    Account,
    AggregateTransaction,
    Deadline,
    EmptyMessage,
    HashLockTransaction,
    Listener,
    NetworkCurrencyMosaic,
    NetworkType,
    PlainMessage,
    PublicAccount,
    TransactionHttp,
    TransferTransaction,
    UInt64,
} from 'nem2-sdk';

import {filter, mergeMap} from 'rxjs/operators';

/* start block 01 */
const nodeUrl = 'http://localhost:3000';
const transactionHttp = new TransactionHttp(nodeUrl);
const listener = new Listener(nodeUrl);

const alicePrivateKey = process.env.ALICE_PRIVATE_KEY as string;
const aliceAccount = Account.createFromPrivateKey(alicePrivateKey, NetworkType.MIJIN_TEST);

const bobPublicKey = process.env.BOB_PUBLIC_KEY as string;
const bobAccount = PublicAccount.createFromPublicKey(bobPublicKey, NetworkType.MIJIN_TEST);
/* end block 01 */

/* start block 02 */
const transferTransaction1 = TransferTransaction.create(
    Deadline.create(),
    bobAccount.address,
    [],
    PlainMessage.create('send me 20 cat.currency'),
    NetworkType.MIJIN_TEST);
/* end block 02 */

/* start block 03 */
const transferTransaction2 = TransferTransaction.create(
    Deadline.create(),
    aliceAccount.address,
    [NetworkCurrencyMosaic.createRelative(20)],
    EmptyMessage,
    NetworkType.MIJIN_TEST);
/* end block 03 */

/* start block 04 */
const aggregateTransaction = AggregateTransaction.createBonded(
    Deadline.create(),
    [transferTransaction1.toAggregate(aliceAccount.publicAccount),
        transferTransaction2.toAggregate(bobAccount)],
    NetworkType.MIJIN_TEST);
/* end block 04 */

/* start block 05 */
const networkGenerationHash = process.env.NETWORK_GENERATION_HASH as string;
const signedTransaction = aliceAccount.sign(aggregateTransaction, networkGenerationHash);

const hashLockTransaction = HashLockTransaction.create(
    Deadline.create(),
    NetworkCurrencyMosaic.createRelative(10),
    UInt64.fromUint(480),
    signedTransaction,
    NetworkType.MIJIN_TEST);

const hashLockTransactionSigned = aliceAccount.sign(hashLockTransaction, networkGenerationHash);

listener.open().then(() => {

    transactionHttp
        .announce(hashLockTransactionSigned)
        .subscribe(x => console.log(x), err => console.error(err));

    listener
        .confirmed(aliceAccount.address)
        .pipe(
            filter((transaction) => transaction.transactionInfo !== undefined
                && transaction.transactionInfo.hash === hashLockTransactionSigned.hash),
            mergeMap(ignored => transactionHttp.announceAggregateBonded(signedTransaction))
        )
        .subscribe(announcedAggregateBonded => console.log(announcedAggregateBonded),
            err => console.error(err));
});
/* end block 05 */
