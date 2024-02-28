---
outline: deep
---
# Message Bus
Ving's Message Bus push messages from the server to a logged in user via [Server Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events). This can be useful for displaying a toast via the [notification system](ui), or for triggering some functionality when a background job finishes.

If you'd like to test it, log in to your ving site and then from the CLI type:

```bash
./ving.mjs messagebus -u Admin -m "Hello Admin!"
```

Note that this functionality requires that you've set up the [Redis cache](cache).

## Extending Functionality
If you want to extend this functionality to send your own message types from the server to the browser, you'll need to do the following 3 steps.

### Configure a Publisher Function
In `server/messagebus.mjs` add and export a function that will publish the message. Let's say we're going to update a progress bar somewhere for some background process. We'd create a publisher function for that like:

```js
export const publishSomeProgressBar = async (
    userId, 
    percentageComplete = 0, 
    fullyComplete = 100
) => {
    return publish(
        userId, 
        'someProgressBar', 
        { percentageComplete, fullyComplete }
    );
}
```

Note that you can skip this step and use use the generic `publish` function, but that doesn't give you the opportunity to add defaults, an API, or error handling so we recommend creating a publish function.

### Use The Publisher Function
Wherever in your code that you can get your event data to publish to the browser, use your newly created publisher function.

```js
import {publishSomeProgressBar} from '../server/messagebus.mjs'

await publishSomeProgressBar(userId, 35);
```

### Make The Browser Handle It
You'll need to update `composables/useMessageBus.mjs` to handle your `someProgressBar` message type. Add your new `case` to the `switch` statement there.