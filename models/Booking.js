const mongoose=require('mongoose');
const Review=require('./Review');
const BookingSchema=new mongoose.Schema({
    apptDate:{
        type:Date,
        required:true
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    },

    hotel:{
        type:mongoose.Schema.ObjectId,
        ref:'Hotel',
        required:true},

    
    createdAt:{
        type:Date,
        default:Date.now
    }
},{
    id:false,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

BookingSchema.pre('deleteOne',{document:true,query:false},async function(next){
    console.log(`review by bookingId : ${this._id} Being removed `);
    await this.model('Review').deleteMany({booking:this._id});
    next();
});

module.exports=mongoose.model('Booking',BookingSchema);


