import path from "path";
import {JSONFilePreset} from 'lowdb/node'

const PACKAGE_FILE = path.join(process.cwd(), 'package.json');
const db = await JSONFilePreset(PACKAGE_FILE, {})

function incrementMinorVersion(version) {
    // Split the version string into its components
    const [major, minor, patch] = version.split('.').map(Number);

    // Increment the minor version
    const newPatch = patch + 1;

    // Return the new version string
    return `${major}.${minor}.${newPatch}`; // Reset patch version to 0
}

db.data.version = incrementMinorVersion(db.data.version)
db.write().then(r => {
    console.log('Version patched')
})

