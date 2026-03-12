import logo from './logo.png'
import mat_logo from './mat_logo_new.png'
import add_icon from './add_icon.png'
import order_icon from './order_icon.png'
import profile_image from './profile_image.png'
import upload_area from './upload_area.png'
import parcel_icon from './parcel_icon.png'

import fabric_samples from './fabric-samples.jpg'

export const assets = {
    logo,
    mat_logo,
    fabric_samples,
    add_icon,
    order_icon,
    profile_image,
    upload_area,
    parcel_icon
}

export const url = import.meta.env.VITE_BACKEND_URL || 
                   (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" 
                   ? "http://localhost:4000" 
                   : "https://mat-textile-hub.vercel.app");


