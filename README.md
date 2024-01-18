# <img src="apps/desktop/assets/llavero-logo.png" width="200" >

is not ready yet. But If you wanna play just:

`yarn` to install

`yarn desktop` to execute Llavero installer. 


## To Dev:
```
Terminal 1

EMAIL="your@email.com" REGION="us-east-1" AWS_ACCESS_KEY_ID="id" AWS_SECRET_ACCESS_KEY="secret" yarn start-sst

Terminal 2

EMAIL="your@email.com" REGION="us-east-1" AWS_ACCESS_KEY_ID="id" AWS_SECRET_ACCESS_KEY="secret" yarn dev
```
### To emulate next.js prod on local env

```
Terminal 1

EMAIL="your@email.com" REGION="us-east-1" AWS_ACCESS_KEY_ID="id" AWS_SECRET_ACCESS_KEY="secret" yarn start-sst

Terminal 2

EMAIL="your@email.com" REGION="us-east-1" AWS_ACCESS_KEY_ID="id" AWS_SECRET_ACCESS_KEY="secret" yarn workspace web sst bind next build
EMAIL="your@email.com" REGION="us-east-1" AWS_ACCESS_KEY_ID="id" AWS_SECRET_ACCESS_KEY="secret" yarn workspace web sst bind next start
```