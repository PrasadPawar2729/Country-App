const express=require("express")
const app = express()
const connectToDB=require("./config/db")
const cors= require("cors")
const { userRouter } = require("./routes/userrouter")
const { countryRouter } = require("./routes/countryRouter")

require("dotenv").config()


app.use(cors())

app.use(express.json())

app.use('/user', userRouter);
app.use('/countries', countryRouter);



app.listen(process.env.PORT, async() => {
    try{
      
      connectToDB(process.env.MONGO_URL)
      console.log(`Server is running on port ${process.env.PORT}`)
    }
    catch(err){
      console.log(err)
    }
  })