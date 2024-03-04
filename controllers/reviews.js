const Review=require('../models/Review');
const Hotel=require('../models/Hotels');
const User=require('../models/User');
const Booking=require('../models/Booking');

//@desc     Get all Reviews
//@route    GET /api/v1/reviews
//@access   Public
exports.getReviews=async(req,res,next) => {

    let query
    if(req.params.hotelId){
        query=Review.find({hospital:req.params.hotelId})
        .populate({
            path:'hotel',
            select:'-_id name'
        })
        .populate({
            path:'user',
            select:'-_id name'
        });
    }
    else {
        const reqQuery = {...req.query};

        const removeFields = ['select','sort','page','limit'];
        removeFields.forEach(param=>delete reqQuery[param]);
        
        //console.log(reqQuery);
    
        let queryStr = JSON.stringify(reqQuery);
        queryStr=queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,match=>`$${match}`);
        
        query = Review.find(JSON.parse(queryStr))
        .populate({
            path:'hotel',
            select:'-_id name'
        })
        .populate({
            path:'user',
            select:'-_id name'
        });
    }
   
    
    //Select fields
    if(req.query.select){
        const fields=req.query.select.split(',').join(' ');
        query=query.select(fields);
    }

    //Sort
    if(req.query.sort){
        const sortBy=req.query.sort.split(',').join(' ');
        query=query.sort(sortBy);
    }
    else{
        query=query.sort('createdAt');
    }

    const page=parseInt(req.query.page,10) || 1;
    const limit=parseInt(req.query.limit,10) || 25;
    const startIndex=(page-1)*limit;
    const endIndex=page*limit;
    

    try{
        const total = await Review.countDocuments(query);
        query=query.skip(startIndex).limit(limit);

        const reviews = await query;
        const pagination={};
        if(endIndex<total){
            pagination.next={page:page+1,limit}
        }
        if(startIndex>0){
            pagination.prev={page:page-1,limit}
        }
    
        res.status(200).json({
            success:true,
            count:reviews.length,
            pagination,
            data:reviews
        });
    } catch(err){
        res.status(400).json({success:false});
    }
};

//@desc     Get single review
//@route    GET /api/v1/reviews/:id
//@access   Public
exports.getReview=async (req,res,next)=>{
    try{
        const review=await Review.findById(req.params.id)
        .populate({
            path:'hotel',
            select:'-_id name'
        })
        .populate({
            path:'user',
            select:'-_id name'
        });

        if(!review){
            return res.status(404).json({success:false,msg:`No review with the id of ${req.params.id}`});
        }
        res.status(200).json({
            success:true,
            data:review
        });
    }
    catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false,msg:'Cannot find Review'});
    }
};

//@desc     Add Review
//@route    POST /api/v1/booking/:bookingId/reviews/
//@access   Private
exports.addReview=async(req,res,next)=>{
    try{
        req.body.booking=req.params.bookingId;
        const booking=await Booking.find({_id : req.params.bookingId});
        
        if(!booking){
            return res.status(404).json({success:false,msg:`No booking with the id ${req.params.bookingId}`});
        }
        //console.log(booking[0]);
        //console.log(req.user.id);
        //add userId to req.body
        req.body.user=req.user.id;
        req.body.hotel=booking[0].hotel;
        
        ////make sure user is the booking owner
        if(booking[0].user.toString()!==req.user.id){
            return res.status(401).json({success:false,msg:`User ${req.user.id} is not authorized to review`});
        }

        //Check for existed Review
        const existedReview=await Review.find({booking:req.params.bookingId}); 
        //console.log(existedReview);
        if(existedReview.length>0){//รีวิวไปเเล้ว
            return res.status(400).json({success:false,msg:`The booking with id ${req.params.bookingId} has existed Review`});
        }
        
        console.log(req.body);
        const review=await Review.create(req.body);
        
        res.status(200).json({success:true,data:review});
    }
    catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false,msg:'Cannot create Review'});
    }
};

//@desc     Update a review
//@route    PUT /api/v1/reviews/:id
//@access   Private
exports.updateReview=async(req,res,next)=>{
    try{
        let review=await Review.findById(req.params.id);

        if(!review){
            return res.status(404).json({success:false,msg:`No Review with the id of ${req.params.id}`});
        }
        //make sure user is the apoointment owner
        if(review.user.toString()!==req.user.id && req.user.role!=='admin'){
            return res.status(401).json({success:false,msg:`User ${req.user.id} is not authorized to update this Review`});
        }
        review=await Review.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
        res.status(200).json({success:true,data:review});

    }
    catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false,msg:'Cannot update Review'});
    }
};

//@desc     Delete a Review
//@route    DELETE /api/v1/reviews/:id
//@access   Private
exports.deleteReview=async(req,res,nex)=>{
    try{
            
            const review=await Review.findById(req.params.id);
            if(!review){
                return res.status(404).json({success:false,msg:`No review with the id of ${req.params.id}`});
            }
            //make sure user is the apoointment owner
            if(review.user.toString()!==req.user.id && req.user.role!=='admin'){
            return res.status(401).json({success:false,msg:`User ${req.user.id} is not authorized to delete this review`});
            }

            await review.deleteOne();
            res.status(200).json({success:true,data:{}});
    }
    catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false,msg:'Cannot delete review'});
    }
}
