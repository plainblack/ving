import { VingRecord, VingKind } from "#ving/record/VingRecord.mjs";

/** Management of individual API Keys for developer access to the API.
 * @class
 */
export class APIKeyRecord extends VingRecord {

    /**
     * Tests a potential secret to see if it matches the private key stored in the api key.
     * 
     * Usage: `const result = await testSecret('totaly going to work');`
     * 
     * @throws 441 if no secret is passsed
     * @throws 454 secrete doesn't match private key
     * @param {string} secret the secret you'd like to test against the apikeys private key
     * @returns `true`
     */
    async testSecret(secret) {
        if (secret == undefined || secret == '')
            throw ouch(441, 'You must specify a secret.');
        if (this.get('privateKey') != secret)
            throw ouch(454, 'Secret does not match.');
        return true;
    }

}

/** Management of all API Keys.
 * @class
 */
export class APIKeyKind extends VingKind {
    // add custom Kind code here
}