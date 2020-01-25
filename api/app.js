import express from "express";

import temperatureRouter from "./temperature";
import servoRouter from "./servo";


// setup app
const app = express();
app.use(express.json());


// configure apis
const apis = [
	["/temperature", temperatureRouter],
	["/servo", servoRouter],
];

const globalRouter = express.Router();
globalRouter.get("/", (req, res) => res.json({version:"0.0.0",apis:apis.map(a => a[0])}));

apis.map(api => app.use(...api));
app.use("/", globalRouter);


// start server
const port = process.env.PORT || 36000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));


export default app;