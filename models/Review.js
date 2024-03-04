const mongoose=require('mongoose');
const Hotel = require('./Hotel');

const ReviewSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    },
    booking:{
        type:mongoose.Schema.ObjectId,
        ref:'Booking',
        required:true
    },
    hotel:{
        type:mongoose.Schema.ObjectId,
        ref:'Hotel',
        required:true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
},{
    id:false,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

  
ReviewSchema.post('save', async function () {
    const avgRating = await this.constructor.aggregate([
      { $match: { hotel: this.hotel } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    await Hotel.findByIdAndUpdate(this.hotel, { rating: avgRating[0].avgRating });
});

ReviewSchema.post('findOneAndUpdate', async function () {
    const query = this.getQuery(); 
    const doc = await this.model.findOne(query); 
    const avgRating = await this.model.aggregate([
        { $match: { hotel: doc.hotel } }, 
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    await Hotel.findByIdAndUpdate(doc.hotel, { rating: avgRating[0].avgRating });
});

ReviewSchema.pre('deleteOne', async function () {
    const query = this.getQuery(); 
    const doc = await this.model.findOne(query); 
    const avgRating = await this.model.aggregate([
        { $match: { hotel: doc.hotel } }, 
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    const countDocuments = await this.model.countDocuments({ hotel: doc.hotel });
    let newRating;
    if(countDocuments-1==0)newRating=0;
    else newRating = (((avgRating[0].avgRating)*countDocuments )-doc.rating)/(countDocuments-1);
    // console.log("fff");
    // console.log(doc.rating);
    // console.log(countDocuments);
    // console.log(avgRating);
    // console.log(newRating)
    await Hotel.findByIdAndUpdate(doc.hotel, { rating: newRating});
});

module.exports=mongoose.model('Review',ReviewSchema);