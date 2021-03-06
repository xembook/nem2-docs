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
    AliasActionType,
    AliasTransaction,
    Deadline,
    MosaicId,
    NamespaceId,
    NetworkType,
    TransactionHttp
} from "nem2-sdk";

/* start block 01 */
const namespaceId = new NamespaceId('foo');
const mosaicId = new MosaicId('7cdf3b117a3c40cc');
/* end block 01 */

/* start block 02 */
const mosaicAliasTransaction = AliasTransaction.createForMosaic(
    Deadline.create(),
    AliasActionType.Link,
    namespaceId,
    mosaicId,
    NetworkType.MIJIN_TEST
);

const privateKey = process.env.PRIVATE_KEY as string;
const account = Account.createFromPrivateKey(privateKey, NetworkType.MIJIN_TEST);
const networkGenerationHash = process.env.NETWORK_GENERATION_HASH as string;
const signedTransaction = account.sign(mosaicAliasTransaction, networkGenerationHash);

const transactionHttp = new TransactionHttp('http://localhost:3000');
transactionHttp
    .announce(signedTransaction)
    .subscribe(x => console.log(x), err => console.error(err));
/* end block 02 */
