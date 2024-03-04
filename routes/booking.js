const express=require('express');
const {getAllBooking,getBooking,addBooking,updateBooking,deleteBooking}=require('../controllers/booking');


const reviewRouter=require('./reviews');

const router=express.Router({mergeParams:true});
const{protect,authorize}=require('../middleware/auth');

router.use('/:bookingId/reviews/',reviewRouter);

router.use('/:bookingId/reviews/',reviewRouter);

router.route('/').get(protect,getAppointments).post(protect,authorize('admin','user'),addAppointment);
router.route('/:id').get(protect,getAppointment).put(protect,authorize('admin','user'),updateAppointment).delete(protect,authorize('admin','user'),deleteAppointment);


module.exports=router;