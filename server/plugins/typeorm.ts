import { defineNitroPlugin } from 'nitropack/dist/runtime/plugin'
import { initialize } from '../../typeorm/data-source'

export default defineNitroPlugin(async () => {
    try {
        await initialize()
    } catch (error) {
        console.trace('Error thrown during DB initialization, aborting startup', error)
        process.exit(-1)
    }
})
