const Database = require("../../../connections/connection");
const Feedback = Database.feedback;




const feedback = async (req,res) => {
    try {
        const {listenerId,userId,rating,feedback} = req.body
        const data = {
            listenerId:listenerId,
            rating:rating,
            feedback:feedback,
            userId:userId
        }
        Feedback.create(data).then((result) => {
            res.status(200).send({
                message: "feedback created successfully",
                feedback: result,
              });
        })
       
    } catch (error) {
        console.error("Error creating coupen:", error);
        res.status(500).send({
          message: "Error creating coupen",
          error: error,
        });
    }
}


module.exports = {
    feedback,
}