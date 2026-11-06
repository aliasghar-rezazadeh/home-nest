import Navigation from "@/components/common/Navigation";

function Footer() {
    return (
        <>
            <footer className='h-auto pt-10 px-3.75 mr-15 flex flex-col flex-nowrap items-center xl:items-start xl:px-25 xl:justify-between xl:flex-row xl:flex-wrap border-t border-t-[#C4C4C4]'>

                <div className="pr-3.75 p-1.75 pl-2.5 flex justify-around flex-col items-start ">
                    <p className="text-[30px] font-bold mb-4">Furniro.</p>
                    <p className="mb-5 mt-12.5 text-base-medium text-custom-gray">400 University Drive Suite 200 Coral <br/> Gables, FL <br/> 33134 USA</p>
                </div> 
                <div>
                    <p className='text-base-medium text-custom-gray '>Links</p>
                    <ul className='mt-13.75'>
                        <Navigation className="mb-11.5"/>
                    </ul>
                </div>
                <div>
                    <p className='text-base-medium text-custom-gray'>Help</p>
                    <ul className='mt-13.75'>
                        <li className="mb-11.5">Payment Options</li>
                        <li className="mb-11.5">Returns</li>
                        <li className="mb-11.5">Privacy Policies</li>
                    </ul>
                </div>
                <div >
                    <p className='text-base-medium text-custom-gray'>Newsletter</p>
                    <div className='mt-13.75 xl:items-start items-center'>
                        <input
                            type="text"
                            name="input"
                            placeholder="Enter Your Email Address"
                            required
                            aria-label="text"
                            className="grow border-0 border-b-2 border-gray-400 focus:border-custom-main focus:outline-none py-2"
                        />
                        <button type="submit" className="ml-4 px-4 py-2 border-b-2 border-custom-gray focus:outline-none">
                            SUBSCRIBE
                        </button>
                    </div>
                </div>
            </footer>

            <p className="flex justify-center mt-5 xl:mt-0">
                <span className='text-[13px] text-custom-gray border-t-2 border-t-[#D9D9D9] py-2.5 xl:px-50 font-poppins'>2025 furino. <a href="https://www.linkedin.com/in/aliasghar-rezazadeh" target="_blank">Aliasghar Rezazadeh</a> All rights reverved</span>
            </p>
        </>
    );
}

export default Footer;
