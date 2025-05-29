import React from 'react';

const Card = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {/* Card 1 */}
      <div className="bg-[#E6F6FE] p-6 rounded-lg  relative">
        {/* الصورة في الزاوية العلوية اليسرى */}
     
      
            <img
              src="/bulkofmoney.png"  // Removed "public" from path
              alt="Logo"
              className="h-20 w-20 rounded-sm border-2 border-[#707070]" // Added white border
            />
        
   

        {/* المحتوى الخاص بالـ card */}
        <div className="mt-4"> {/* إضافة مسافة من الأعلى لكي لا تتداخل الصورة مع النص */}
    
          <p className="text-[#707070]">Total Estimated Amount</p>
          <h3 className="text-3xl font-semibold mt-4 text-[#023047]">7.7M</h3>
        </div>
      </div>

      {/* Card 2 */}
      <div className="bg-[#E6F6FE] p-6 rounded-lg  relative">
        {/* الصورة في الزاوية العلوية اليسرى */}
     
      
            <img
              src="/salary.png"  // Removed "public" from path
              alt="Logo"
              className="h-20 w-20 rounded-sm border-2 border-[#707070]" // Added white border
            />
        
   

        {/* المحتوى الخاص بالـ card */}
        <div className="mt-4"> {/* إضافة مسافة من الأعلى لكي لا تتداخل الصورة مع النص */}
    
          <p className="text-[#707070]">Total Payment</p>
          <h3 className="text-3xl font-semibold mt-4 text-[#023047]">7.7M</h3>
        </div>
      </div>

      {/* Card 3 */}
      <div className="bg-[#E6F6FE] p-6 rounded-lg  relative">
        {/* الصورة في الزاوية العلوية اليسرى */}
     
      
            <img
              src="/bag.png"  // Removed "public" from path
              alt="Logo"
              className="h-20 w-20 rounded-sm border-2 border-[#707070]" // Added white border
            />
        
   

        {/* المحتوى الخاص بالـ card */}
        <div className="mt-4"> {/* إضافة مسافة من الأعلى لكي لا تتداخل الصورة مع النص */}
    
          <p className="text-[#707070]">Total Projects</p>
          <div className='flex flex-row'>
          <h3 className="text-3xl font-semibold mt-4 text-[#023047]">7.7 </h3>
          <span className='mt-6 mr-5'>projects</span>
          </div>
        </div>
      </div>
    </div>
  );    
};

export default Card;