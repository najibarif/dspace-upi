export default function FindPatent() {
    return (
        <section className='bg-[#F5F5F5] min-h-[250px] md:min-h-[300px] flex flex-col items-center justify-center pt-16 md:pt-24'>
            <div className='text-center w-full max-w-4xl mx-auto px-4'>
                {/* Judul + Icon */}
                <h2 className='text-3xl md:text-4xl font-bold mb-6 md:mb-8 flex items-center justify-center gap-2'>
                    <span className='material-symbols-outlined !text-4xl'>
                        gavel
                    </span>
                    <span>Find Patent</span>
                </h2>

                {/* Search Box */}
                <div className='flex flex-col items-center gap-2 w-full px-2 sm:px-4'>
                    <div className='w-full max-w-2xl flex rounded overflow-hidden border border-gray-300'>
                        <input
                            type='text'
                            placeholder='Find Patent title'
                            className='flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base outline-none'
                        />
                        <button className='bg-gray-700 hover:bg-gray-800 px-4 sm:px-6 flex items-center justify-center'>
                            <span className='material-symbols-outlined text-white text-xl sm:text-2xl'>
                                search
                            </span>
                        </button>
                    </div>
                    <div className='w-full max-w-xl flex justify-end'>
                        <button className='text-xs sm:text-sm text-gray-500 hover:text-gray-700'>
                            Advanced Search
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
