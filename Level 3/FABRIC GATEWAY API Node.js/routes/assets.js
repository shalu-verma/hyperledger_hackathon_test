var express = require("express");
var router = express.Router();
const grpc = require("@grpc/grpc-js");
const crypto = require("crypto");
const fabricGateway = require("@hyperledger/fabric-gateway");
const fs = require('fs/promises');

const utf8Decoder = new TextDecoder();

const getContract = async () => {
  const credentials = await fs.readFile("../config/certificate.pem");
  const identity = { mspId: "myorg", credentials };
  const privateKeyPem = await fs.readFile("../config/privateKey.pem");
  const privateKey = crypto.createPrivateKey(privateKeyPem);
  const signer = fabricGateway.signers.newPrivateKeySigner(privateKey);

  const client = new grpc.Client(
    "localhost:7051",
    grpc.credentials.createInsecure()
  );
  const gateway = fabricGateway.connect({ identity, signer, client });

  // Get the network and contract objects
  const network = await gateway.getNetwork("mychannel");
  const contract = network.getContract("AssetContract");
};

router.post("/create-asset", async (req, res) => {
  try {
    const contract = getContract();

    // Invoke the createAsset method with the provided data
    const result = await contract.submitTransaction(
      "createAsset",
      JSON.stringify(req.body)
    );

    // Return the result to the client
    res.send(result.toString());
  } catch (err) {
    // Handle any errors and return an appropriate response
    console.error(err);
    res.status(500).send("Error invoking chaincode method");
  }
});

router.put("/update-asset", async (req, res) => {
  try {
    const contract = getContract();
    // Invoke the updateAsset method with the provided data
    const result = await contract.submitTransaction(
      "updateAsset",
      JSON.stringify(req.body)
    );

    // Return the result to the client
    res.send(result.toString());
  } catch (err) {
    // Handle any errors and return an appropriate response
    console.error(err);
    res.status(500).send("Error invoking chaincode method");
  }
});

router.get("/read-asset", async (req, res) => {
  try {
    const contract = getContract();
    // Invoke the createAsset method
    const result = await contract.evaluateTransaction("readAsset");

    // Return the result to the client
    res.send(result.toString());
  } catch (err) {
    // Handle any errors and return an appropriate response
    console.error(err);
    res.status(500).send("Error invoking chaincode method");
  }
});

router.get("/get-asset-history", async (req, res) => {
  try {
    const contract = getContract();
    // Invoke the getAssetHistory method
    const result = await contract.evaluateTransaction("getAssetHistory");

    // Return the result to the client
    res.send(result.toString());
  } catch (err) {
    // Handle any errors and return an appropriate response
    console.error(err);
    res.status(500).send("Error invoking chaincode method");
  }
});
module.exports = router;
