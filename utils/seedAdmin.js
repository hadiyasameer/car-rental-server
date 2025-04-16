import bcrypt from 'bcrypt';
import { Dealer } from '../models/dealerModel.js'; // adjust if your model file name is different

const seedAdmin = async () => {
    const existingAdmin = await Dealer.findOne({ role: 'admin' });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

        const newAdmin = new Dealer({
            email: process.env.ADMIN_EMAIL,
            password: hashedPassword,
            role: 'admin'
        });

        await newAdmin.save();
        console.log('✅ Default admin created');
    } else {
        console.log('ℹ️ Admin already exists');
    }
};

export default seedAdmin;
