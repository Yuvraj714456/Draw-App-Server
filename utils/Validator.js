import {body,validationResult} from 'express-validator'
import { ErrorHandler } from './utility.js';

const registerValidator = ()=>[
    body("name","Please Enter Name").notEmpty(),
    body("username","Please Enter Username").notEmpty(),
    body("email","Please Enter email").notEmpty(),
    body("password","Please Enter Password").notEmpty(),
    body("confirmPassword","Please Enter confirmPassword").notEmpty(),
]

const loginValidator =()=>[
    body().custom((body) => {
    if (!body.email && !body.username) {
      throw new Error("Please Enter Email or Username");
    }
    return true;
  }),
    body("password","Please Enter Password").notEmpty()
]

const validateHandler=(req,res,next)=>{
    const errors=validationResult(req);

    const errorMessage = errors.array().map((error)=>error.msg).join(',');

    if(errors.isEmpty()) return next();
    else{
        return next(new ErrorHandler(errorMessage,400));
    }
}

export {
    registerValidator,
    loginValidator,
    validateHandler
}