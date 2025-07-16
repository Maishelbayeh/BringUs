import React, { useState, useEffect } from 'react';

interface CustomPhoneInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// استخدام بيانات من مكتبة react-phone-input-2
const COUNTRY_CODES = [
  // الدول العربية أولاً
  { code: '+970', label: 'فلسطين', country: 'PS' },
  { code: '+966', label: 'السعودية', country: 'SA' },
  { code: '+20', label: 'مصر', country: 'EG' },
  { code: '+962', label: 'الأردن', country: 'JO' },
  { code: '+963', label: 'سوريا', country: 'SY' },
  { code: '+964', label: 'العراق', country: 'IQ' },
  { code: '+965', label: 'الكويت', country: 'KW' },
  { code: '+971', label: 'الإمارات', country: 'AE' },
  { code: '+973', label: 'البحرين', country: 'BH' },
  { code: '+974', label: 'قطر', country: 'QA' },
  { code: '+968', label: 'عمان', country: 'OM' },
  { code: '+967', label: 'اليمن', country: 'YE' },
  { code: '+961', label: 'لبنان', country: 'LB' },
  { code: '+972', label: 'إسرائيل', country: 'IL' },
  
  // باقي الدول
  { code: '+1', label: 'USA/Canada', country: 'US' },
  { code: '+44', label: 'المملكة المتحدة', country: 'GB' },
  { code: '+33', label: 'فرنسا', country: 'FR' },
  { code: '+49', label: 'ألمانيا', country: 'DE' },
  { code: '+39', label: 'إيطاليا', country: 'IT' },
  { code: '+34', label: 'إسبانيا', country: 'ES' },
  { code: '+31', label: 'هولندا', country: 'NL' },
  { code: '+32', label: 'بلجيكا', country: 'BE' },
  { code: '+41', label: 'سويسرا', country: 'CH' },
  { code: '+43', label: 'النمسا', country: 'AT' },
  { code: '+46', label: 'السويد', country: 'SE' },
  { code: '+47', label: 'النرويج', country: 'NO' },
  { code: '+45', label: 'الدنمارك', country: 'DK' },
  { code: '+358', label: 'فنلندا', country: 'FI' },
  { code: '+48', label: 'بولندا', country: 'PL' },
  { code: '+420', label: 'جمهورية التشيك', country: 'CZ' },
  { code: '+36', label: 'المجر', country: 'HU' },
  { code: '+40', label: 'رومانيا', country: 'RO' },
  { code: '+421', label: 'سلوفاكيا', country: 'SK' },
  { code: '+386', label: 'سلوفينيا', country: 'SI' },
  { code: '+385', label: 'كرواتيا', country: 'HR' },
  { code: '+387', label: 'البوسنة والهرسك', country: 'BA' },
  { code: '+389', label: 'مقدونيا الشمالية', country: 'MK' },
  { code: '+382', label: 'الجبل الأسود', country: 'ME' },
  { code: '+381', label: 'صربيا', country: 'RS' },
  { code: '+355', label: 'ألبانيا', country: 'AL' },
  { code: '+30', label: 'اليونان', country: 'GR' },
  { code: '+351', label: 'البرتغال', country: 'PT' },
  { code: '+353', label: 'أيرلندا', country: 'IE' },
  { code: '+354', label: 'آيسلندا', country: 'IS' },
  { code: '+372', label: 'إستونيا', country: 'EE' },
  { code: '+371', label: 'لاتفيا', country: 'LV' },
  { code: '+370', label: 'ليتوانيا', country: 'LT' },
  { code: '+375', label: 'بيلاروسيا', country: 'BY' },
  { code: '+380', label: 'أوكرانيا', country: 'UA' },
  { code: '+7', label: 'روسيا', country: 'RU' },
  { code: '+90', label: 'تركيا', country: 'TR' },
  { code: '+994', label: 'أذربيجان', country: 'AZ' },
  { code: '+995', label: 'جورجيا', country: 'GE' },
  { code: '+374', label: 'أرمينيا', country: 'AM' },
  { code: '+93', label: 'أفغانستان', country: 'AF' },
  { code: '+98', label: 'إيران', country: 'IR' },
  { code: '+91', label: 'الهند', country: 'IN' },
  { code: '+86', label: 'الصين', country: 'CN' },
  { code: '+81', label: 'اليابان', country: 'JP' },
  { code: '+82', label: 'كوريا الجنوبية', country: 'KR' },
  { code: '+65', label: 'سنغافورة', country: 'SG' },
  { code: '+60', label: 'ماليزيا', country: 'MY' },
  { code: '+66', label: 'تايلاند', country: 'TH' },
  { code: '+84', label: 'فيتنام', country: 'VN' },
  { code: '+62', label: 'إندونيسيا', country: 'ID' },
  { code: '+63', label: 'الفلبين', country: 'PH' },
  { code: '+61', label: 'أستراليا', country: 'AU' },
  { code: '+64', label: 'نيوزيلندا', country: 'NZ' },
  { code: '+27', label: 'جنوب أفريقيا', country: 'ZA' },
  { code: '+234', label: 'نيجيريا', country: 'NG' },
  { code: '+212', label: 'المغرب', country: 'MA' },
  { code: '+213', label: 'الجزائر', country: 'DZ' },
  { code: '+216', label: 'تونس', country: 'TN' },
  { code: '+218', label: 'ليبيا', country: 'LY' },
  { code: '+249', label: 'السودان', country: 'SD' },
  { code: '+251', label: 'إثيوبيا', country: 'ET' },
  { code: '+254', label: 'كينيا', country: 'KE' },
  { code: '+255', label: 'تنزانيا', country: 'TZ' },
  { code: '+256', label: 'أوغندا', country: 'UG' },
  { code: '+233', label: 'غانا', country: 'GH' },
  { code: '+225', label: 'ساحل العاج', country: 'CI' },
  { code: '+221', label: 'السنغال', country: 'SN' },
  { code: '+237', label: 'الكاميرون', country: 'CM' },
  { code: '+236', label: 'جمهورية أفريقيا الوسطى', country: 'CF' },
  { code: '+235', label: 'تشاد', country: 'TD' },
  { code: '+241', label: 'الغابون', country: 'GA' },
  { code: '+242', label: 'جمهورية الكونغو', country: 'CG' },
  { code: '+243', label: 'جمهورية الكونغو الديمقراطية', country: 'CD' },
  { code: '+244', label: 'أنغولا', country: 'AO' },
  { code: '+245', label: 'غينيا بيساو', country: 'GW' },
  { code: '+246', label: 'إقليم المحيط الهندي البريطاني', country: 'IO' },
  { code: '+247', label: 'جزيرة أسينشين', country: 'AC' },
  { code: '+248', label: 'سيشل', country: 'SC' },
  { code: '+250', label: 'رواندا', country: 'RW' },
  { code: '+252', label: 'الصومال', country: 'SO' },
  { code: '+253', label: 'جيبوتي', country: 'DJ' },
  { code: '+257', label: 'بوروندي', country: 'BI' },
  { code: '+258', label: 'موزمبيق', country: 'MZ' },
  { code: '+260', label: 'زامبيا', country: 'ZM' },
  { code: '+261', label: 'مدغشقر', country: 'MG' },
  { code: '+262', label: 'ريونيون', country: 'RE' },
  { code: '+263', label: 'زيمبابوي', country: 'ZW' },
  { code: '+264', label: 'ناميبيا', country: 'NA' },
  { code: '+265', label: 'ملاوي', country: 'MW' },
  { code: '+266', label: 'ليسوتو', country: 'LS' },
  { code: '+267', label: 'بوتسوانا', country: 'BW' },
  { code: '+268', label: 'إسواتيني', country: 'SZ' },
  { code: '+269', label: 'جزر القمر', country: 'KM' },
  { code: '+290', label: 'سانت هيلينا', country: 'SH' },
  { code: '+291', label: 'إريتريا', country: 'ER' },
  { code: '+297', label: 'أروبا', country: 'AW' },
  { code: '+298', label: 'جزر فارو', country: 'FO' },
  { code: '+299', label: 'جرينلاند', country: 'GL' },
  { code: '+350', label: 'جبل طارق', country: 'GI' },
  { code: '+352', label: 'لوكسمبورغ', country: 'LU' },
  { code: '+356', label: 'مالطا', country: 'MT' },
  { code: '+357', label: 'قبرص', country: 'CY' },
  { code: '+359', label: 'بلغاريا', country: 'BG' },
  { code: '+373', label: 'مولدوفا', country: 'MD' },
  { code: '+376', label: 'أندورا', country: 'AD' },
  { code: '+377', label: 'موناكو', country: 'MC' },
  { code: '+378', label: 'سان مارينو', country: 'SM' },
  { code: '+379', label: 'الفاتيكان', country: 'VA' },
  { code: '+383', label: 'كوسوفو', country: 'XK' },
  { code: '+423', label: 'ليختنشتاين', country: 'LI' },
  { code: '+500', label: 'جزر فوكلاند', country: 'FK' },
  { code: '+501', label: 'بليز', country: 'BZ' },
  { code: '+502', label: 'غواتيمالا', country: 'GT' },
  { code: '+503', label: 'السلفادور', country: 'SV' },
  { code: '+504', label: 'هندوراس', country: 'HN' },
  { code: '+505', label: 'نيكاراغوا', country: 'NI' },
  { code: '+506', label: 'كوستاريكا', country: 'CR' },
  { code: '+507', label: 'بنما', country: 'PA' },
  { code: '+508', label: 'سان بيير وميكلون', country: 'PM' },
  { code: '+509', label: 'هايتي', country: 'HT' },
  { code: '+590', label: 'غوادلوب', country: 'GP' },
  { code: '+591', label: 'بوليفيا', country: 'BO' },
  { code: '+592', label: 'غيانا', country: 'GY' },
  { code: '+593', label: 'الإكوادور', country: 'EC' },
  { code: '+594', label: 'غيانا الفرنسية', country: 'GF' },
  { code: '+595', label: 'باراغواي', country: 'PY' },
  { code: '+596', label: 'مارتينيك', country: 'MQ' },
  { code: '+597', label: 'سورينام', country: 'SR' },
  { code: '+598', label: 'الأوروغواي', country: 'UY' },
  { code: '+599', label: 'جزر الأنتيل الهولندية', country: 'AN' },
  { code: '+670', label: 'تيمور الشرقية', country: 'TL' },
  { code: '+672', label: 'أنتاركتيكا', country: 'AQ' },
  { code: '+673', label: 'بروناي', country: 'BN' },
  { code: '+674', label: 'ناورو', country: 'NR' },
  { code: '+675', label: 'بابوا غينيا الجديدة', country: 'PG' },
  { code: '+676', label: 'تونغا', country: 'TO' },
  { code: '+677', label: 'جزر سليمان', country: 'SB' },
  { code: '+678', label: 'فانواتو', country: 'VU' },
  { code: '+679', label: 'فيجي', country: 'FJ' },
  { code: '+680', label: 'بالاو', country: 'PW' },
  { code: '+681', label: 'واليس وفوتونا', country: 'WF' },
  { code: '+682', label: 'جزر كوك', country: 'CK' },
  { code: '+683', label: 'نيوي', country: 'NU' },
  { code: '+685', label: 'ساموا', country: 'WS' },
  { code: '+686', label: 'كيريباتي', country: 'KI' },
  { code: '+687', label: 'كاليدونيا الجديدة', country: 'NC' },
  { code: '+688', label: 'توفالو', country: 'TV' },
  { code: '+689', label: 'بولينيزيا الفرنسية', country: 'PF' },
  { code: '+690', label: 'توكيلاو', country: 'TK' },
  { code: '+691', label: 'ولايات ميكرونيسيا الموحدة', country: 'FM' },
  { code: '+692', label: 'جزر مارشال', country: 'MH' },
  { code: '+850', label: 'كوريا الشمالية', country: 'KP' },
  { code: '+852', label: 'هونغ كونغ', country: 'HK' },
  { code: '+853', label: 'ماكاو', country: 'MO' },
  { code: '+855', label: 'كمبوديا', country: 'KH' },
  { code: '+856', label: 'لاوس', country: 'LA' },
  { code: '+880', label: 'بنغلاديش', country: 'BD' },
  { code: '+886', label: 'تايوان', country: 'TW' },
  { code: '+960', label: 'جزر المالديف', country: 'MV' },
  { code: '+975', label: 'بوتان', country: 'BT' },
  { code: '+976', label: 'منغوليا', country: 'MN' },
  { code: '+977', label: 'نيبال', country: 'NP' },
  { code: '+992', label: 'طاجيكستان', country: 'TJ' },
  { code: '+993', label: 'تركمانستان', country: 'TM' },
  { code: '+996', label: 'قيرغيزستان', country: 'KG' },
  { code: '+998', label: 'أوزبكستان', country: 'UZ' },
].sort((a, b) => {
  // ترتيب الدول العربية أولاً
  const arabCountries = ['PS', 'SA', 'EG', 'JO', 'SY', 'IQ', 'KW', 'AE', 'BH', 'QA', 'OM', 'YE', 'LB'];
  const aIsArab = arabCountries.includes(a.country);
  const bIsArab = arabCountries.includes(b.country);
  
  if (aIsArab && !bIsArab) return -1;
  if (!aIsArab && bIsArab) return 1;
  
  return a.label.localeCompare(b.label);
});

const getInitialParts = (value: string) => {
  for (const c of COUNTRY_CODES) {
    if (value.startsWith(c.code)) {
      return { code: c.code, number: value.slice(c.code.length) };
    }
  }
  return { code: '+970', number: value };
};

const CustomPhoneInput: React.FC<CustomPhoneInputProps> = ({
  label,
  value,
  onChange,
  required,
  error,
  placeholder,
  className,
  disabled
}) => {
  const initial = getInitialParts(value || '');
  const [countryCode, setCountryCode] = useState(initial.code);
  const [number, setNumber] = useState(initial.number);

  useEffect(() => {
    onChange(countryCode + number);
    // eslint-disable-next-line
  }, [countryCode, number]);

  useEffect(() => {
    // Sync if parent changes value
    const parts = getInitialParts(value || '');
    setCountryCode(parts.code);
    setNumber(parts.number);
    // eslint-disable-next-line
  }, [value]);

  return (
    <div>
      {label && (
        <label className="block mb-2 text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="flex gap-2 ">
        <select
          className="border rounded-lg p-2 bg-gray-50 text-gray-900 focus:ring-primary focus:border-primary max-w-[140px] min-w-[140px]"
          value={countryCode}
          onChange={e => setCountryCode(e.target.value)}
        >
          {COUNTRY_CODES.map(c => (
            <option key={`${c.code}-${c.country}`} value={c.code}>
              {c.code} {c.label}
            </option>
          ))}
        </select>
        <input
          type="tel"
          className={`appearance-none border text-sm rounded-lg block w-full p-3 transition-all duration-200
            ${disabled ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-gray-50 text-gray-900  focus:ring-primary focus:border-primary'}
            dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary
            ${error ? 'border-red-500' : ''} ${className}`}
          value={number}
          onChange={e => setNumber(e.target.value.replace(/[^\d]/g, ''))}
          placeholder={placeholder || '5xxxxxxxx'}
          required={required}
        />
      </div>
      {error && <span className="mt-1 text-xs text-red-600 block">{error}</span>}
    </div>
  );
};

export default CustomPhoneInput; 