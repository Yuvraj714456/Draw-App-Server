

const errorMiddleware = (err,req,res,next)=>{

    err.message ||= "Internal Server Error";
    err.statusCode ||=500;

    if(err.code === 11000){
        const field = Object.keys(err.keyPattern).join(",");
        err.message =  `Duplicate field: ${field}`;
        err.statusCode=400;
    }

    if(err.name === "CastError"){
        err.message=   `invalid format for field: ${err.path}`;
        err.statusCode = 400;
    }

    return res.status(err.statusCode).json({
        success:false,
        message:err.message,
    })
}


const Trycatch = (passedFunction) => async(req,res,next)=>{
    try {
        await passedFunction(req,res,next);
    }catch (error) {
        next (error);
    }
}

export {Trycatch,errorMiddleware}