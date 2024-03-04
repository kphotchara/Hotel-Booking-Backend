
const Booking=require('../models/Booking');
const Hotel=require('../models/Hotel');


//@desc     Get all appointments
//@route    GET /api/v1/appointments
//@access   Public

exports.getAllBooking=async (req,res,next)=>{
    let query;
    //Generalusers can see only their appointments
    if(req.user.role!=='admin'){
        query=Booking.find({user:req.user.id}).populate({
            path:'hotel',
            select:'name address tel'
        });
    }
    else{ //admin
        if(req.params.hotelId){
            console.log(req.params.hotelId);
            query=Booking.find({hotel:req.params.hotelId}).populate({
                path:'hotel',
                select:'name address tel'
            });
        }
        else{
            query=Booking.find().populate({
                path:'hotel',
                select:'name address tel'

            });
        }
    }

    try{

        const allBooking=await query;

        res.status(200).json({success:true,count:allBooking.length,data:allBooking});
    }
    catch(err){
        console.log(err);
        return res.status(500).json({success:false,msg:'Cannot find Booking'});

    }
}

//@desc     Get single appointment
//@route    GET /api/v1/appointments/:id
//@access   Public

exports.getBooking=async (req,res,next)=>{
    try{
        const booking=await Booking.findById(req.params.id).populate({
            path:'hotel',
            select:'name address tel'
        });

        if(!booking){
            return res.status(404).json({success:false,msg:`No Booking with the id of ${req.params.id}`});
        }
        res.status(200).json({
            success:true,
            data:booking

        });
    }
    catch(err){
        console.log(err.stack);

        return res.status(500).json({success:false,msg:'Cannot find Booking'});

    }
};

//@desc     Add appointment
//@route    POST /api/v1/hospitals/:hospitalId/appointments/
//@access   Private

exports.addBooking=async(req,res,next)=>{
    try{
        console.log(req.body);
        req.body.hotel=req.params.hotelId;

        const hotel=await Hotel.findById(req.params.hotelId);

        if(!hotel){
            return res.status(404).json({success:false,msg:`No hotel with the id ${req.params.hotelId}`});

        }
        //add userId to req.body
        req.body.user=req.user.id;
        //Check for existed appointment

        const existedBooking=await Booking.find({user:req.user.id});
        //If the user is not a admin,they can only create 3 appointments
        if(existedBooking.length>=3 && req.usesr.role!=='admin'){
            return res.status(400).json({success:false,msg:`The user with id ${req.user.id} has already made 3 booking`});
        }

        const booking=await Booking.create(req.body);
        res.status(200).json({success:true,data:booking});
    }
    catch(error){
        console.log(error);
        return res.status(500).json({success:false,msg:'Cannot create Booking'});

    }
};

//@desc     Update appointment
//@route    PUT /api/v1/appointments/:id
//@access   Private

exports.updateBooking=async(req,res,next)=>{
    try{
        let booking=await Booking.findById(req.params.id);

        if(!booking){
            return res.status(404).json({success:false,msg:`No Booking with the id of ${req.params.id}`});
        }
        //make sure user is the apoointment owner
        if(booking.user.toString()!==req.user.id && req.user.role!=='admin'){
            return res.status(401).json({success:false,msg:`User ${req.user.id} is not authorized to update this Booking`});
        }
        booking=await Booking.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
        res.status(200).json({success:true,data:booking});


    }
    catch(err){
        console.log(err.stack);

        return res.status(500).json({success:false,msg:'Cannot update Booking'});

    }
};


//@desc     Delete appointment
//@route    DELETE /api/v1/appointments/:id
//@access   Private

exports.deleteBooking=async(req,res,nex)=>{
    try{
            const booking=await Booking.findById(req.params.id);
            if(!booking){
                return res.status(404).json({success:false,msg:`No Booking with the id of ${req.params.id}`});
            }
            //make sure user is the apoointment owner
            if(booking.user.toString()!==req.user.id && req.user.role!=='admin'){
            return res.status(401).json({success:false,msg:`User ${req.user.id} is not authorized to delete this booking`});
            }

            await booking.deleteOne();

            res.status(200).json({success:true,data:{}});
    }
    catch(err){
        console.log(err.stack);

        return res.status(500).json({success:false,msg:'Cannot delete Booking'});

    }
}