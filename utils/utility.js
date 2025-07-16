class ErrorHandler extends Error{
    constructor(message,statusCode,errors=[],stack=""){
        super(message);
        this.statusCode = statusCode;
        this.data=null;
        this.message=message;
        this.success=false;
        this.error=errors;
        if(stack){
            this.stack=stack;
        }else{
            Error.captureStackTrace(this,this.constructor);
        }
    }
}

export {ErrorHandler}