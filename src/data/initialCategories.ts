export const initialCategories = [
  // الإلكترونيات
  { id: 1, nameAr: 'الكترونيات', nameEn: 'Electronics', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=facearea&w=40&h=40', descriptionAr: 'كل ما يتعلق بالأجهزة الإلكترونية والتقنية الحديثة.', descriptionEn: 'All about electronics and modern technology.', order: 1, visible: true, parentId: null },
  
  { id: 2, nameAr: 'هواتف', nameEn: 'Phones', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=facearea&w=40&h=40', descriptionAr: 'جميع أنواع الهواتف الذكية والعادية.', descriptionEn: 'All types of smartphones and regular phones.', order: 2, visible: true, parentId: 1 },
  { id: 5, nameAr: 'لابتوبات', nameEn: 'Laptops', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=facearea&w=40&h=40', descriptionAr: 'أحدث أجهزة الكمبيوتر المحمولة.', descriptionEn: 'Latest laptop computers.', order: 5, visible: true, parentId: 1 },
  {
    id: 112,
    nameAr: 'أندرويد',
    nameEn: 'Android',
    image: 'https://images.unsplash.com/photo-1580910051070-dbe9c1d1a54c?auto=format&fit=facearea&w=40&h=40',
    descriptionAr: 'هواتف تعمل بنظام أندرويد من مختلف الشركات.',
    descriptionEn: 'Phones running Android OS from various brands.',
    order: 1,
    visible: true,
    parentId: 2,
  },
  {
    id: 113,
    nameAr: 'آيفون',
    nameEn: 'iPhone',
    image: 'https://images.unsplash.com/photo-1611186871348-b3a8b6f3f6c6?auto=format&fit=facearea&w=40&h=40',
    descriptionAr: 'هواتف آيفون من شركة أبل.',
    descriptionEn: 'iPhones from Apple.',
    order: 2,
    visible: true,
    parentId: 2,
  },
  {
    id: 114,
    nameAr: 'هواتف مستعملة',
    nameEn: 'Used Phones',
    image: 'https://images.unsplash.com/photo-1580910365206-d9f3c4f95b49?auto=format&fit=facearea&w=40&h=40',
    descriptionAr: 'هواتف مستعملة بحالة جيدة وبأسعار مناسبة.',
    descriptionEn: 'Used phones in good condition at reasonable prices.',
    order: 3,
    visible: true,
    parentId: 2,
  },
  {
    id: 115,
    nameAr: 'إكسسوارات الهواتف',
    nameEn: 'Phone Accessories',
    image: 'https://images.unsplash.com/photo-1575908532042-60f0ec83744c?auto=format&fit=facearea&w=40&h=40',
    descriptionAr: 'كفرات، سماعات، شواحن، وغيرها من الإكسسوارات.',
    descriptionEn: 'Covers, headsets, chargers, and other accessories.',
    order: 4,
    visible: true,
    parentId: 2,
  },
  // الملابس
  { id: 6, nameAr: 'ملابس', nameEn: 'Clothes', image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=facearea&w=40&h=40', descriptionAr: 'ملابس رجالية ونسائية وأطفال.', descriptionEn: 'Men, women, and kids clothing.', order: 6, visible: false, parentId: null },
  { id: 7, nameAr: 'رجالي', nameEn: 'Men', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=facearea&w=40&h=40', descriptionAr: 'ملابس وإكسسوارات رجالية.', descriptionEn: "Men's clothing and accessories.", order: 7, visible: true, parentId: 6 },
  { id: 8, nameAr: 'نسائي', nameEn: 'Women', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&w=40&h=40', descriptionAr: 'ملابس وإكسسوارات نسائية.', descriptionEn: "Women's clothing and accessories.", order: 8, visible: false, parentId: 6 },
  { id: 9, nameAr: 'أطفال', nameEn: 'Kids', image: 'https://images.unsplash.com/photo-1618354691261-27e1b26cfa7a?auto=format&fit=facearea&w=40&h=40', descriptionAr: 'ملابس للأطفال من جميع الأعمار.', descriptionEn: 'Clothing for kids of all ages.', order: 9, visible: true, parentId: 6 },

  // الأثاث
  { id: 10, nameAr: 'أثاث', nameEn: 'Furniture', image: 'https://images.unsplash.com/photo-1582582494700-13d44fc98c5d?auto=format&fit=facearea&w=40&h=40', descriptionAr: 'أثاث منزلي ومكتبي.', descriptionEn: 'Home and office furniture.', order: 10, visible: true, parentId: null },
  { id: 11, nameAr: 'غرف نوم', nameEn: 'Bedrooms', image: 'https://images.unsplash.com/photo-1585559605151-8c84e9a34bc4?auto=format&fit=facearea&w=40&h=40', descriptionAr: 'أسرة وخزائن ومستلزمات النوم.', descriptionEn: 'Beds, wardrobes, and sleep accessories.', order: 11, visible: true, parentId: 10 },
  { id: 12, nameAr: 'غرف جلوس', nameEn: 'Living Rooms', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=facearea&w=40&h=40', descriptionAr: 'كنب وطاولات ومجالس.', descriptionEn: 'Sofas, tables, and living room setups.', order: 12, visible: true, parentId: 10 },

  // كتب
  { id: 13, nameAr: 'كتب', nameEn: 'Books', image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=facearea&w=40&h=40', descriptionAr: 'كتب لجميع الأعمار والاهتمامات.', descriptionEn: 'Books for all ages and interests.', order: 13, visible: true, parentId: null },
  { id: 14, nameAr: 'روايات', nameEn: 'Novels', image: 'https://images.unsplash.com/photo-1551022378-4e6ef5f962d4?auto=format&fit=facearea&w=40&h=40', descriptionAr: 'روايات عربية وأجنبية.', descriptionEn: 'Arabic and international novels.', order: 14, visible: true, parentId: 13 },
  { id: 15, nameAr: 'كتب أطفال', nameEn: 'Children Books', image: 'https://images.unsplash.com/photo-1603570421520-20c2f80f05d6?auto=format&fit=facearea&w=40&h=40', descriptionAr: 'قصص وكتب تعليمية للأطفال.', descriptionEn: 'Stories and learning books for children.', order: 15, visible: true, parentId: 13 },

  // طعام ومواد غذائية
  { id: 16, nameAr: 'أطعمة', nameEn: 'Food', image: 'https://images.unsplash.com/photo-1605478522019-344b12ef6e14?auto=format&fit=facearea&w=40&h=40', descriptionAr: 'منتجات غذائية طازجة ومعلبة.', descriptionEn: 'Fresh and canned food products.', order: 16, visible: true, parentId: null },
  { id: 17, nameAr: 'خضروات', nameEn: 'Vegetables', image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=facearea&w=40&h=40', descriptionAr: 'خضروات طازجة يومياً.', descriptionEn: 'Fresh daily vegetables.', order: 17, visible: true, parentId: 16 },
  { id: 18, nameAr: 'فواكه', nameEn: 'Fruits', image: 'https://images.unsplash.com/photo-1574226516831-e1dff420e8f8?auto=format&fit=facearea&w=40&h=40', descriptionAr: 'أجود أنواع الفاكهة.', descriptionEn: 'Best quality fruits.', order: 18, visible: true, parentId: 16 },
]; 