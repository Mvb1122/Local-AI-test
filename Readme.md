# Local AI Test
Something I made as a weekend project using Transformers.js

## Installation
1. Just clone the repo 
2. run `npm i`
3. run `node index.js`
4. Wait for a few minutes.
5. Type some stuff in and hit enter. 
6. The AI responds
7. Go back to 5, then follow the directions as you did before.
8. How did you get here? 

## Neat things you can write into the chat:
If you write these, then things will happen.
- `new` Creates a new conversation
- `rec \d` Recovers a specific conversation. Put the conversation ID (name of file in ./Past Convos/) where \d is.
- If you put `max=\d` in your message, then the maximum number of tokens will be changed to that. This is useful becuase it's a bit slow. 