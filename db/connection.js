import mongoose from "mongoose";


const connectionDB = async () => {
    return await mongoose.connect(process.env.URL_CONNECTION)
        .then(() => {
            console.log(`connected to database on ${process.env.URL_CONNECTION}`)
        }).catch((err) => {
            console.log({ msg: "fail to connect", err })
        })
}

export default connectionDB