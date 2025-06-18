export const customersData = [
  { id: 1, nameAr: 'أحمد علي', nameEn: 'Ahmed Ali', phone: '0501234567' },
  { id: 2, nameAr: 'سارة محمد', nameEn: 'Sara Mohammed', phone: '0559876543' },
  { id: 3, nameAr: 'خالد يوسف', nameEn: 'Khaled Youssef', phone: '0533333333' },
  { id: 4, nameAr: 'منى صالح', nameEn: 'Mona Saleh', phone: '0544444444' },
  { id: 5, nameAr: 'ليلى حسن', nameEn: 'Laila Hassan', phone: '0522222222' },
  { id: 6, nameAr: 'يوسف إبراهيم', nameEn: 'Yousef Ibrahim', phone: '0599999999' },
  { id: 7, nameAr: 'جمال عوض', nameEn: 'Jamal Awad', phone: '0588888888' },
  { id: 8, nameAr: 'هبة سمير', nameEn: 'Hiba Sameer', phone: '0577777777' },
  { id: 9, nameAr: 'رامي جابر', nameEn: 'Rami Jaber', phone: '0566666666' },
  { id: 10, nameAr: 'سلوى ناصر', nameEn: 'Salwa Naser', phone: '0555555555' },
];

export const ordersData = [
  { id: 101, customerId: 1, date: '2025-06-01', price: 200, currencyId: 1, paid: true, deliveryAreaId: 1, affiliateId: 1, products: [ { productId: 1, quantity: 2 }, { productId: 2, quantity: 1 } ], discountTotal: 10, taxTotal: 15, deliveryPrice: 20, storeId: 1, storeName: 'متجر الإلكترونيات', storeUrl: 'https://store1.example.com', storePhone: '0590000001' },
  { id: 95, customerId: 1, date: '2025-05-20', price: 150, currencyId: 1, paid: false, deliveryAreaId: 2, affiliateId: 1, products: [ { productId: 2, quantity: 3 } ], discountTotal: 5, taxTotal: 10, deliveryPrice: 15, storeId: 2, storeName: 'متجر الجوالات', storeUrl: 'https://store2.example.com', storePhone: '0590000002' },
  { id: 99, customerId: 2, date: '2025-05-29', price: 250, currencyId: 2, paid: true, deliveryAreaId: 2, affiliateId: 2, products: [ { productId: 3, quantity: 1 }, { productId: 1, quantity: 1 } ], discountTotal: 0, taxTotal: 20, deliveryPrice: 10, storeId: 3, storeName: 'متجر الساعات', storeUrl: 'https://store3.example.com', storePhone: '0590000003' },
  { id: 90, customerId: 2, date: '2025-05-10', price: 150, currencyId: 5, paid: true, deliveryAreaId: 3, affiliateId: 3, products: [ { productId: 4, quantity: 2 } ], discountTotal: 8, taxTotal: 12, deliveryPrice: 12, storeId: 4, storeName: 'متجر الإكسسوارات', storeUrl: 'https://store4.example.com', storePhone: '0590000004' },
  { id: 88, customerId: 3, date: '2025-05-15', price: 120, currencyId: 3, paid: true, deliveryAreaId: 1, affiliateId: 4, products: [ { productId: 2, quantity: 2 }, { productId: 5, quantity: 1 } ], discountTotal: 6, taxTotal: 9, deliveryPrice: 10, storeId: 5, storeName: 'متجر التقنية', storeUrl: 'https://store5.example.com', storePhone: '0590000005' },
  { id: 77, customerId: 4, date: '2025-05-10', price: 100, currencyId: 2, paid: false, deliveryAreaId: 4, affiliateId: 5, products: [ { productId: 3, quantity: 1 } ], discountTotal: 3, taxTotal: 5, deliveryPrice: 8, storeId: 6, storeName: 'متجر الأجهزة', storeUrl: 'https://store6.example.com', storePhone: '0590000006' },
  { id: 70, customerId: 4, date: '2025-04-30', price: 200, currencyId: 5, paid: true, deliveryAreaId: 5, affiliateId: 5, products: [ { productId: 4, quantity: 2 }, { productId: 5, quantity: 2 } ], discountTotal: 12, taxTotal: 18, deliveryPrice: 14, storeId: 7, storeName: 'متجر المنزل', storeUrl: 'https://store7.example.com', storePhone: '0590000007' },
  { id: 110, customerId: 5, date: '2025-06-03', price: 300, currencyId: 1, paid: true, deliveryAreaId: 6, affiliateId: 2, products: [ { productId: 1, quantity: 4 } ], discountTotal: 15, taxTotal: 22, deliveryPrice: 18, storeId: 8, storeName: 'متجر الكمبيوتر', storeUrl: 'https://store8.example.com', storePhone: '0590000008' },
  { id: 111, customerId: 5, date: '2025-06-04', price: 180, currencyId: 2, paid: false, deliveryAreaId: 7, affiliateId: 1, products: [ { productId: 2, quantity: 2 }, { productId: 3, quantity: 1 } ], discountTotal: 7, taxTotal: 11, deliveryPrice: 13, storeId: 9, storeName: 'متجر الألعاب', storeUrl: 'https://store9.example.com', storePhone: '0590000009' },
  { id: 112, customerId: 5, date: '2025-06-05', price: 220, currencyId: 1, paid: true, deliveryAreaId: 8, affiliateId: 1, products: [ { productId: 5, quantity: 2 } ], discountTotal: 9, taxTotal: 14, deliveryPrice: 16, storeId: 10, storeName: 'متجر الهدايا', storeUrl: 'https://store10.example.com', storePhone: '0590000010' },
  { id: 120, customerId: 6, date: '2025-05-30', price: 90, currencyId: 1, paid: false, deliveryAreaId: 8, affiliateId: 1, products: [ { productId: 4, quantity: 1 } ], discountTotal: 2, taxTotal: 4, deliveryPrice: 6, storeId: 11, storeName: 'متجر الكتب', storeUrl: 'https://store11.example.com', storePhone: '0590000011' },
  { id: 121, customerId: 6, date: '2025-06-01', price: 400, currencyId: 3, paid: true, deliveryAreaId: 10, affiliateId: 3, products: [ { productId: 1, quantity: 2 }, { productId: 3, quantity: 2 } ], discountTotal: 20, taxTotal: 30, deliveryPrice: 25, storeId: 12, storeName: 'متجر البرمجيات', storeUrl: 'https://store12.example.com', storePhone: '0590000012' },
  { id: 130, customerId: 7, date: '2025-06-02', price: 500, currencyId: 3, paid: true, deliveryAreaId: 10, affiliateId: 1, products: [ { productId: 2, quantity: 5 } ], discountTotal: 25, taxTotal: 35, deliveryPrice: 28, storeId: 13, storeName: 'متجر السيارات', storeUrl: 'https://store13.example.com', storePhone: '0590000013' },
  { id: 140, customerId: 8, date: '2025-05-25', price: 210, currencyId: 4, paid: false, deliveryAreaId: 1, affiliateId: 2, products: [ { productId: 5, quantity: 3 } ], discountTotal: 11, taxTotal: 16, deliveryPrice: 12, storeId: 14, storeName: 'متجر الهوايات', storeUrl: 'https://store14.example.com', storePhone: '0590000014' },
  { id: 160, customerId: 10, date: '2025-05-29', price: 250, currencyId: 1, paid: true, deliveryAreaId: 2, affiliateId: 3, products: [ { productId: 1, quantity: 1 }, { productId: 4, quantity: 1 } ], discountTotal: 13, taxTotal: 19, deliveryPrice: 15, storeId: 15, storeName: 'متجر الرياضة', storeUrl: 'https://store15.example.com', storePhone: '0590000015' },
  { id: 161, customerId: 10, date: '2025-06-02', price: 175, currencyId: 4, paid: true, deliveryAreaId: 3, affiliateId: 4, products: [ { productId: 3, quantity: 2 } ], discountTotal: 6, taxTotal: 9, deliveryPrice: 10, storeId: 16, storeName: 'متجر الصحة', storeUrl: 'https://store16.example.com', storePhone: '0590000016' },
];

export const productsData = [
  { id: 1, nameAr: 'هاتف ذكي', nameEn: 'Smartphone', unitId: 22, pricePerUnit: 100, color: '#FF5733', image: '/bag.png' },
  { id: 2, nameAr: 'سماعات لاسلكية', nameEn: 'Wireless Headphones', unitId: 22, pricePerUnit: 50, color: ['#4287f5', '#f542dd'], image: '/user.jpg' },
  { id: 3, nameAr: 'شاحن سريع', nameEn: 'Fast Charger', unitId: 22, pricePerUnit: 25, color: '#2ecc40', image: '/salary.png' },
  { id: 4, nameAr: 'حافظة هاتف', nameEn: 'Phone Case', unitId: 22, pricePerUnit: 20, color: ['#FFD700', '#8B4513'], image: '/bulkofmoney.png' },
  { id: 5, nameAr: 'ساعة ذكية', nameEn: 'Smartwatch', unitId: 22, pricePerUnit: 120, color: '#000000', image: '/logo.png' },
];

export const units = [
  { id: 1, labelAr: 'Bundle', labelEn: 'Bundle' },
  { id: 2, labelAr: 'كرتونة', labelEn: 'Carton' },
  { id: 3, labelAr: 'سنتيمتر', labelEn: 'Centimeter (cm)' },
  { id: 4, labelAr: 'سنتيمتر مكعب', labelEn: 'Cubic centimeter (cu cm)' },
  { id: 5, labelAr: 'قدم مكعب', labelEn: 'Cubic foot (cu ft)' },
  { id: 6, labelAr: 'بوصة مكعبة', labelEn: 'Cubic inch (cu in)' },
  { id: 7, labelAr: 'متر مكعب', labelEn: 'Cubic meter (cu m)' },
  { id: 8, labelAr: 'ياردة مكعبة', labelEn: 'Cubic yard (cu yd)' },
  { id: 9, labelAr: 'عشرة', labelEn: 'Dozen' },
  { id: 10, labelAr: 'أونصة مائعة', labelEn: 'Fluid ounce (fl oz)' },
  { id: 11, labelAr: 'قدم', labelEn: 'Foot (ft)' },
  { id: 12, labelAr: 'غالون', labelEn: 'Gallon (gal)' },
  { id: 13, labelAr: 'جرام', labelEn: 'Gram (g)' },
  { id: 14, labelAr: 'بوصة', labelEn: 'Inch (in)' },
  { id: 15, labelAr: 'كيلوجرام', labelEn: 'Kilogram (kg)' },
  { id: 16, labelAr: 'لتر', labelEn: 'Liter (L)' },
  { id: 17, labelAr: 'متر', labelEn: 'Meter (m)' },
  { id: 18, labelAr: 'مليلتر', labelEn: 'Milliliter (mL)' },
  { id: 19, labelAr: 'أونصة', labelEn: 'Ounce (oz)' },
  { id: 20, labelAr: 'زوج', labelEn: 'Pair' },
  { id: 21, labelAr: 'بالتر', labelEn: 'Pallet' },
  { id: 22, labelAr: 'قطعة', labelEn: 'Piece' },
  { id: 23, labelAr: 'بينت', labelEn: 'Pint (pt)' },
  { id: 24, labelAr: 'رطل', labelEn: 'Pound (lb)' },
  { id: 25, labelAr: 'ريم', labelEn: 'Ream' },
  { id: 26, labelAr: 'لفة', labelEn: 'Roll' },
  { id: 27, labelAr: 'مجموعة', labelEn: 'Set' },  
  { id: 28, labelAr: 'سنتيمتر مربع', labelEn: 'Square centimeter (sq cm)' },
  { id: 29, labelAr: 'قدم مربع', labelEn: 'Square foot (sq ft)' },
  { id: 30, labelAr: 'بوصة مربعة', labelEn: 'Square inch (sq in)' },
  { id: 31, labelAr: 'متر مربع', labelEn: 'Square meter (sq m)' },
  { id: 32, labelAr: 'ياردة مربعة', labelEn: 'Square yard (sq yd)' },
  { id: 33, labelAr: 'ياردة', labelEn: 'Yard (yd)' },
];

export const currencies = [
  { id: 1, labelAr: 'شيكل (₪)', labelEn: ' (₪)' },
  { id: 2, labelAr: 'دولار ($)', labelEn: ' ($)' },
  { id: 3, labelAr: 'دينار أردني (JD)', labelEn: '(JD)' },
  { id: 4, labelAr: 'يورو (€)', labelEn: ' (€)' },
  { id: 5, labelAr: 'ريال سعودي (SAR)', labelEn: '(SAR)' },
];

export const deliveryAreas = [
  { id: 1, labelAr: 'رام الله', labelEn: 'Ramallah' },
  { id: 2, labelAr: 'القدس', labelEn: 'Jerusalem' },
  { id: 3, labelAr: 'نابلس', labelEn: 'Nablus' },
  { id: 4, labelAr: 'الخليل', labelEn: 'Hebron' },
  { id: 5, labelAr: 'بيت لحم', labelEn: 'Bethlehem' },
  { id: 6, labelAr: 'طولكرم', labelEn: 'Tulkarm' },
  { id: 7, labelAr: 'قلقيلية', labelEn: 'Qalqilya' },
  { id: 8, labelAr: 'جنين', labelEn: 'Jenin' },
  { id: 9, labelAr: 'أريحا', labelEn: 'Arara' },
  { id: 10, labelAr: 'سلفيت', labelEn: 'Salfit' },
];

export const affiliates = [
  { id: 1, nameAr: 'محمد عادل', nameEn: 'Mohammad Adel', phone: '0591111111',email: 'mohammad@gmail.com' ,active: true},
  { id: 2, nameAr: 'سعيد منصور', nameEn: 'Saeed Mansour', phone: '0592222222',email: 'saeed@gmail.com' ,active: true},
  { id: 3, nameAr: 'أحمد سمير', nameEn: 'Ahmad Sameer', phone: '0593333333',email: 'ahmad@gmail.com' ,active: true},
  { id: 4, nameAr: 'ليلى يوسف', nameEn: 'Laila Yousef', phone: '0594444444',email: 'laila@gmail.com' ,active: true},
  { id: 5, nameAr: 'سارة جابر', nameEn: 'Sara Jaber', phone: '0595555555',email: 'sara@gmail.com' ,active: true},
];

