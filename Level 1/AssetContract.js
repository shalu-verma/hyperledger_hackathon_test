const { Contract } = require('fabric-contract-api');

class AssetContract extends Contract {

    async createAsset(ctx, dealerId, msisdn, mpin, balance, status) {
        // Check if asset with given key already exists in the ledger
        const assetExists = await this.assetExists(ctx, dealerId);
        if (assetExists) {
            throw new Error(`Asset with key ${dealerId} already exists`);
        }

        // Create a new asset object
        const asset = {
            dealerId: dealerId,
            msisdn: msisdn,
            mpin: mpin,
            balance: balance,
            status: status,
            transactions: []
        };

        // Add the asset to the world state
        await ctx.stub.putState(dealerId, Buffer.from(JSON.stringify(asset)));
    }

    async updateAsset(ctx, dealerId, balance, status, transAmount, transType, remarks) {
        // Check if asset with given key already exists in the ledger
        const assetExists = await this.assetExists(ctx, dealerId);
        if (!assetExists) {
            throw new Error(`Asset with key ${dealerId} does not exist`);
        }

        // Get the current asset object from the world state
        const assetBuffer = await ctx.stub.getState(dealerId);
        const asset = JSON.parse(assetBuffer.toString());

        // Update the asset object with the new values
        asset.balance = balance;
        asset.status = status;

        // Add the transaction details to the asset object
        const transaction = {
            transAmount: transAmount,
            transType: transType,
            remarks: remarks
        };
        asset.transactions.push(transaction);

        // Update the asset in the world state
        await ctx.stub.putState(dealerId, Buffer.from(JSON.stringify(asset)));
    }

    async readAsset(ctx, dealerId) {
        // Check if asset with given key already exists in the ledger
        const assetExists = await this.assetExists(ctx, dealerId);
        if (!assetExists) {
            throw new Error(`Asset with key ${dealerId} does not exist`);
        }

        // Get the current asset object from the world state and return it
        const assetBuffer = await ctx.stub.getState(dealerId);
        const asset = JSON.parse(assetBuffer.toString());
        return asset;
    }

    async getAssetHistory(ctx, dealerId) {
        // Check if asset with given key already exists in the ledger
        const assetExists = await this.assetExists(ctx, dealerId);
        if (!assetExists) {
            throw new Error(`Asset with key ${dealerId} does not exist`);
        }

        // Get the transaction history of the asset from the world state
        const resultsIterator = await ctx.stub.getHistoryForKey(dealerId);
        const history = [];
        while (true) {
            const res = await resultsIterator.next();
            if (res.value && res.value.value.toString()) {
                const transaction = JSON.parse(res.value.value.toString('utf8'));
                history.push(transaction);
            }
            if (res.done) {
                await resultsIterator.close();
                return history;
            }
        }
    }

    async assetExists(ctx, dealerId) {
        const assetBuffer = await ctx.stub.getState(dealerId);
        return assetBuffer && assetBuffer.length > 0;
    }

}

module.exports = AssetContract;
