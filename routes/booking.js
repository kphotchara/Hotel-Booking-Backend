const express=require('express');
const {getAllBooking,getBooking,addBooking,updateBooking,deleteBooking}=require('../controllers/booking');


const reviewRouter=require('./reviews');

const router=express.Router({mergeParams:true});
const{protect,authorize}=require('../middleware/auth');

router.use('/:bookingId/reviews/',reviewRouter);

router.route('/').get(protect,getAllBooking).post(protect,authorize('admin','user'),addBooking);
router.route('/:id').get(protect,getBooking).put(protect,authorize('admin','user'),updateBooking).delete(protect,authorize('admin','user'),deleteBooking);

module.exports=router;