const Card = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 p-2 sm:p-3 md:p-4">
      {/* Card 1 */}
      <div className="bg-[#E6F6FE] p-4 sm:p-5 md:p-6 rounded-lg relative hover:shadow-lg transition-shadow duration-200">
        {/* Image */}
        <div className="flex justify-start mb-3 sm:mb-4">
          <img
            src="/bulkofmoney.png"
            alt="Money Icon"
            className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-sm border-2 border-[#707070] object-cover"
          />
        </div>

        {/* Content */}
        <div className="space-y-2 sm:space-y-3">
          <p className="text-[#707070] text-sm sm:text-base font-medium">Total Estimated Amount</p>
          <h3 className="text-2xl sm:text-3xl font-semibold text-[#023047]">
            7.7M
          </h3>
        </div>
      </div>

      {/* Card 2 */}
      <div className="bg-[#E6F6FE] p-4 sm:p-5 md:p-6 rounded-lg relative hover:shadow-lg transition-shadow duration-200">
        {/* Image */}
        <div className="flex justify-start mb-3 sm:mb-4">
          <img
            src="/salary.png"
            alt="Salary Icon"
            className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-sm border-2 border-[#707070] object-cover"
          />
        </div>

        {/* Content */}
        <div className="space-y-2 sm:space-y-3">
          <p className="text-[#707070] text-sm sm:text-base font-medium">Total Payment</p>
          <h3 className="text-2xl sm:text-3xl font-semibold text-[#023047]">
            7.7M
          </h3>
        </div>
      </div>

      {/* Card 3 */}
      <div className="bg-[#E6F6FE] p-4 sm:p-5 md:p-6 rounded-lg relative hover:shadow-lg transition-shadow duration-200">
        {/* Image */}
        <div className="flex justify-start mb-3 sm:mb-4">
          <img
            src="/bag.png"
            alt="Bag Icon"
            className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-sm border-2 border-[#707070] object-cover"
          />
        </div>

        {/* Content */}
        <div className="space-y-2 sm:space-y-3">
          <p className="text-[#707070] text-sm sm:text-base font-medium">Total Projects</p>
          <div className='flex flex-row items-baseline gap-1 sm:gap-2'>
            <h3 className="text-2xl sm:text-3xl font-semibold text-[#023047]">
              7.7
            </h3>
            <span className='text-sm sm:text-base text-[#023047] font-medium'>projects</span>
          </div>
        </div>
      </div>
    </div>
  );    
};

export default Card;