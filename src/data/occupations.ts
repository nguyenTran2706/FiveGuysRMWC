import type { CaseFile, Language, Localized } from '../types';

/**
 * Industry and job lists for the intake. The saved value is always the stable English key below,
 * never the translated label, so drafts, exports and the backend read the same value in either language.
 *
 * Industries are the 19 ANZSIC 2006 divisions. Jobs are based on ANZSCO occupation titles, weighted
 * toward work that international students and migrant workers commonly do in Sydney, and include every
 * job held by a character in the stories (see tests/occupations.test.mjs).
 */

export const OTHER_CHOICE = 'other';

export type IndustryCode =
  | 'agriculture_forestry_fishing' | 'mining' | 'manufacturing' | 'electricity_gas_water_waste'
  | 'construction' | 'wholesale_trade' | 'retail_trade' | 'accommodation_food'
  | 'transport_postal_warehousing' | 'information_media_telecommunications' | 'financial_insurance'
  | 'rental_hiring_real_estate' | 'professional_scientific_technical' | 'administrative_support'
  | 'public_administration_safety' | 'education_training' | 'health_care_social_assistance'
  | 'arts_recreation' | 'other_services';

export interface Industry { key: IndustryCode; division: string; label: Localized; keywords: string; search: string }
export interface Occupation { key: string; industries: readonly [IndustryCode, ...IndustryCode[]]; label: Localized; search: string }

/** Lower-case, accent-free text, so "phu bep" finds "Phụ bếp" and "thợ nail" finds "Thợ làm móng (thợ nail)". */
export function normalizeSearch(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
    .replace(/['’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

/** Every word the person typed must appear somewhere in the option's search text. */
export function matchesQuery(search: string, query: string): boolean {
  return normalizeSearch(query).split(' ').filter(Boolean).every(token => search.includes(token));
}

const industry = (key: IndustryCode, division: string, vi: string, en: string, keywords: string): Industry =>
  ({ key, division, label: { vi, en }, keywords, search: normalizeSearch(`${vi} ${en} ${keywords}`) });

export const industries: Industry[] = [
  industry('agriculture_forestry_fishing', 'A', 'Nông nghiệp, lâm nghiệp và thủy sản', 'Agriculture, Forestry and Fishing', 'farm farming trang trai nong trai hai trai cay fruit picking harvest vuon rau fishing'),
  industry('mining', 'B', 'Khai khoáng', 'Mining', 'mine mỏ fifo quarry'),
  industry('manufacturing', 'C', 'Sản xuất, chế biến (nhà máy)', 'Manufacturing', 'factory nhà máy xưởng chế biến meat thịt food production'),
  industry('electricity_gas_water_waste', 'D', 'Điện, khí đốt, nước và xử lý rác thải', 'Electricity, Gas, Water and Waste Services', 'utilities rác waste recycling tái chế'),
  industry('construction', 'E', 'Xây dựng', 'Construction', 'building builder xây dựng công trình site phụ hồ thợ hồ renovation trades tradie'),
  industry('wholesale_trade', 'F', 'Bán buôn (bán sỉ)', 'Wholesale Trade', 'wholesale bán sỉ distribution phân phối import export'),
  industry('retail_trade', 'G', 'Bán lẻ (cửa hàng, siêu thị)', 'Retail Trade', 'shop store supermarket siêu thị cửa hàng tiệm grocery tạp hóa'),
  industry('accommodation_food', 'H', 'Lưu trú và dịch vụ ăn uống (khách sạn, nhà hàng, quán cà phê)', 'Accommodation and Food Services', 'hospitality restaurant cafe coffee hotel motel nhà hàng quán ăn khách sạn fast food takeaway phở bakery'),
  industry('transport_postal_warehousing', 'I', 'Vận tải, bưu chính và kho bãi (giao hàng, kho)', 'Transport, Postal and Warehousing', 'logistics delivery warehouse giao hàng kho uber doordash shipper tài xế courier driver'),
  industry('information_media_telecommunications', 'J', 'Thông tin, truyền thông và viễn thông', 'Information Media and Telecommunications', 'media telecom internet nbn báo chí'),
  industry('financial_insurance', 'K', 'Tài chính và bảo hiểm', 'Financial and Insurance Services', 'bank ngân hàng finance insurance bảo hiểm'),
  industry('rental_hiring_real_estate', 'L', 'Cho thuê và bất động sản', 'Rental, Hiring and Real Estate Services', 'real estate nhà đất bất động sản property rental hire'),
  industry('professional_scientific_technical', 'M', 'Dịch vụ chuyên môn, khoa học và kỹ thuật', 'Professional, Scientific and Technical Services', 'it accounting kế toán law luật engineering kỹ sư design office văn phòng'),
  industry('administrative_support', 'N', 'Dịch vụ hành chính và hỗ trợ (vệ sinh, cung ứng lao động)', 'Administrative and Support Services', 'cleaning vệ sinh lao công tạp vụ labour hire agency công ty cung ứng call centre tổng đài'),
  industry('public_administration_safety', 'O', 'Hành chính công và an ninh (bảo vệ)', 'Public Administration and Safety', 'government chính phủ council security bảo vệ'),
  industry('education_training', 'P', 'Giáo dục và đào tạo', 'Education and Training', 'school trường học tutoring gia sư teaching dạy học college'),
  industry('health_care_social_assistance', 'Q', 'Y tế và trợ giúp xã hội (chăm sóc người cao tuổi, người khuyết tật, trẻ em)', 'Health Care and Social Assistance', 'aged care nhà dưỡng lão disability ndis hospital bệnh viện childcare nhà trẻ nursing carer'),
  industry('arts_recreation', 'R', 'Nghệ thuật và giải trí', 'Arts and Recreation Services', 'gym sport thể thao event sự kiện club casino'),
  industry('other_services', 'S', 'Dịch vụ khác (làm móng, làm tóc, sửa chữa, giặt ủi)', 'Other Services', 'nail làm móng tiệm nail beauty thẩm mỹ hair tóc salon massage repair sửa chữa mechanic'),
];

const industryIndex = new Map(industries.map(item => [item.key, item]));

const job = (key: string, codes: readonly [IndustryCode, ...IndustryCode[]], vi: string, en: string, keywords = ''): Occupation =>
  ({ key, industries: codes, label: { vi, en }, search: normalizeSearch(`${vi} ${en} ${keywords}`) });

export const occupations: Occupation[] = [
  // A — Agriculture, Forestry and Fishing
  job('farm_hand', ['agriculture_forestry_fishing'], 'Công nhân nông trại', 'Farm hand / farm worker', 'farmhand'),
  job('fruit_picker', ['agriculture_forestry_fishing'], 'Người hái trái cây / rau củ', 'Fruit or vegetable picker', 'picker hái nho hái dâu hái cam vineyard grape 88 days'),
  job('packing_shed_worker', ['agriculture_forestry_fishing', 'manufacturing'], 'Công nhân nhà đóng gói nông sản', 'Packing shed worker', 'packhouse đóng gói phân loại'),
  job('nursery_worker', ['agriculture_forestry_fishing'], 'Công nhân vườn ươm / nhà kính', 'Nursery or greenhouse worker', 'plant cây giống'),
  job('livestock_worker', ['agriculture_forestry_fishing'], 'Công nhân trại chăn nuôi / gia cầm', 'Livestock or poultry farm worker', 'chicken gà bò cattle dairy sữa'),
  // B — Mining
  job('mine_worker', ['mining'], 'Công nhân mỏ', 'Mine worker / driller’s offsider', 'drill khoan plant operator'),
  // C — Manufacturing
  job('factory_hand', ['manufacturing'], 'Công nhân nhà máy', 'Factory hand / process worker', 'production line dây chuyền assembly lắp ráp'),
  job('meat_processor', ['manufacturing'], 'Công nhân chế biến thịt / gia cầm', 'Meat or poultry processing worker', 'abattoir lò mổ boner slicer xẻ thịt chicken gà'),
  job('food_production_worker', ['manufacturing'], 'Công nhân sản xuất thực phẩm', 'Food production worker', 'food factory chế biến thực phẩm'),
  job('baker', ['manufacturing', 'retail_trade'], 'Thợ làm bánh mì', 'Baker', 'bakery lò bánh bánh mì'),
  job('pastry_cook', ['manufacturing', 'accommodation_food'], 'Thợ làm bánh ngọt', 'Pastry cook', 'cake bánh ngọt patissier'),
  job('butcher', ['manufacturing', 'retail_trade'], 'Thợ pha lóc / bán thịt', 'Butcher or smallgoods maker', 'meat thịt'),
  job('machine_operator', ['manufacturing'], 'Người vận hành máy', 'Machine operator', 'máy móc cnc'),
  job('sewing_machinist', ['manufacturing'], 'Thợ may công nghiệp', 'Sewing machinist / clothing worker', 'may mặc garment textile'),
  job('welder', ['manufacturing', 'construction'], 'Thợ hàn', 'Welder / metal fabricator', 'weld hàn kim loại'),
  // D — Electricity, Gas, Water and Waste Services
  job('waste_recycling_worker', ['electricity_gas_water_waste'], 'Công nhân thu gom rác / tái chế', 'Waste collection or recycling worker', 'garbage rubbish sorter'),
  // E — Construction
  job('construction_labourer', ['construction'], 'Lao động phổ thông xây dựng (phụ hồ)', 'Construction labourer', 'labourer demolition tháo dỡ'),
  job('tiler', ['construction'], 'Thợ ốp lát gạch', 'Wall and floor tiler', 'tile ốp lát gạch'),
  job('painter', ['construction'], 'Thợ sơn', 'Painter', 'painting sơn nhà'),
  job('carpenter', ['construction'], 'Thợ mộc', 'Carpenter / joiner', 'wood gỗ framing'),
  job('electricians_assistant', ['construction'], 'Phụ thợ điện / phụ việc tay nghề', 'Electrician’s assistant / trades assistant', 'electricians assistant phụ thợ điện'),
  job('electrician', ['construction'], 'Thợ điện', 'Electrician', 'electrical điện'),
  job('plumber', ['construction'], 'Thợ ống nước', 'Plumber', 'plumbing ống nước'),
  job('plasterer', ['construction'], 'Thợ trát / lắp tấm thạch cao', 'Plasterer / gyprocker', 'plaster thạch cao gyprock'),
  job('concreter', ['construction'], 'Thợ bê tông', 'Concreter', 'concrete bê tông'),
  job('bricklayer', ['construction'], 'Thợ xây (thợ hồ)', 'Bricklayer', 'brick gạch'),
  job('scaffolder', ['construction'], 'Thợ giàn giáo', 'Scaffolder', 'scaffold giàn giáo'),
  job('traffic_controller', ['construction'], 'Nhân viên điều tiết giao thông (công trường)', 'Traffic controller', 'traffic control cầm cờ stop slow'),
  // F — Wholesale Trade
  job('wholesale_sales_rep', ['wholesale_trade'], 'Nhân viên kinh doanh bán buôn', 'Wholesale sales representative', 'sales rep'),
  job('import_export_clerk', ['wholesale_trade', 'transport_postal_warehousing'], 'Nhân viên xuất nhập khẩu', 'Import / export clerk', 'customs hải quan'),
  // G — Retail Trade
  job('retail_assistant', ['retail_trade'], 'Nhân viên bán hàng', 'Retail / sales assistant', 'shop assistant bán hàng'),
  job('cashier', ['retail_trade'], 'Nhân viên thu ngân', 'Checkout operator / cashier', 'checkout thu ngân tính tiền register'),
  job('shelf_filler', ['retail_trade'], 'Nhân viên xếp hàng lên kệ', 'Shelf filler / night filler', 'stocker night fill xếp hàng'),
  job('grocery_store_worker', ['retail_trade'], 'Nhân viên tiệm tạp hóa / chợ châu Á', 'Grocery or Asian supermarket worker', 'grocer tạp hóa chợ asian'),
  job('retail_supervisor', ['retail_trade'], 'Giám sát / quản lý cửa hàng', 'Retail supervisor / store manager', 'store manager quản lý cửa hàng'),
  job('pharmacy_assistant', ['retail_trade'], 'Nhân viên nhà thuốc', 'Pharmacy assistant', 'chemist nhà thuốc'),
  job('service_station_attendant', ['retail_trade'], 'Nhân viên cây xăng', 'Service station attendant', 'petrol station cây xăng'),
  // H — Accommodation and Food Services
  job('kitchen_hand', ['accommodation_food'], 'Phụ bếp', 'Kitchen hand', 'dishwasher rửa chén rửa bát'),
  job('cook', ['accommodation_food'], 'Người nấu bếp (cook)', 'Cook', 'nấu ăn bếp line cook'),
  job('chef', ['accommodation_food'], 'Đầu bếp (chef)', 'Chef', 'head chef bếp trưởng sous chef'),
  job('waiter', ['accommodation_food'], 'Nhân viên phục vụ bàn', 'Waiter / waitress', 'waitress waiting staff chạy bàn bồi bàn'),
  job('barista', ['accommodation_food'], 'Nhân viên pha cà phê (barista)', 'Barista', 'pha chế'),
  job('bartender', ['accommodation_food'], 'Nhân viên quầy bar', 'Bar attendant / bartender', 'bar pub rsa đồ uống'),
  job('fast_food_crew', ['accommodation_food'], 'Nhân viên cửa hàng thức ăn nhanh', 'Fast food crew member', 'mcdonalds kfc hungry jacks thức ăn nhanh'),
  job('food_counter_attendant', ['accommodation_food'], 'Nhân viên quầy đồ ăn mang đi', 'Café or takeaway counter attendant', 'counter quầy mang đi tiệm bánh mì'),
  job('food_preparation_assistant', ['accommodation_food'], 'Nhân viên chuẩn bị đồ ăn (sushi, bánh mì, pizza)', 'Food preparation assistant (sushi, sandwiches, pizza)', 'sandwich prep'),
  job('restaurant_manager', ['accommodation_food'], 'Quản lý / giám sát nhà hàng, quán cà phê', 'Café or restaurant manager / supervisor', 'manager supervisor quản lý'),
  job('hotel_housekeeper', ['accommodation_food', 'administrative_support'], 'Nhân viên buồng phòng khách sạn', 'Hotel housekeeper / room attendant', 'housekeeping dọn phòng'),
  job('hotel_receptionist', ['accommodation_food'], 'Lễ tân khách sạn', 'Hotel or motel receptionist', 'front desk lễ tân'),
  // I — Transport, Postal and Warehousing
  job('warehouse_worker', ['transport_postal_warehousing', 'wholesale_trade'], 'Công nhân kho / thủ kho', 'Warehouse worker / storeperson', 'storeman storewoman nhân viên kho'),
  job('picker_packer', ['transport_postal_warehousing', 'wholesale_trade', 'retail_trade'], 'Nhân viên soạn hàng / đóng gói', 'Picker / packer', 'pick pack đóng gói soạn hàng amazon'),
  job('forklift_driver', ['transport_postal_warehousing', 'manufacturing'], 'Tài xế xe nâng', 'Forklift driver', 'xe nâng lf licence'),
  job('delivery_rider', ['transport_postal_warehousing', 'accommodation_food'], 'Người giao hàng (xe đạp / xe máy)', 'Delivery rider (bicycle or scooter)', 'uber eats menulog giao đồ ăn xe đạp xe máy bike'),
  job('delivery_driver', ['transport_postal_warehousing'], 'Tài xế giao hàng / chuyển phát', 'Delivery or courier driver', 'van amazon flex parcel bưu kiện'),
  job('rideshare_driver', ['transport_postal_warehousing'], 'Tài xế xe công nghệ / taxi', 'Rideshare or taxi driver', 'uber didi ola grab xe công nghệ'),
  job('truck_driver', ['transport_postal_warehousing'], 'Tài xế xe tải', 'Truck driver', 'truck xe tải hr mr'),
  job('bus_driver', ['transport_postal_warehousing'], 'Tài xế xe buýt / xe khách', 'Bus or coach driver', 'bus xe buýt'),
  job('removalist', ['transport_postal_warehousing'], 'Nhân viên chuyển nhà', 'Removalist', 'moving chuyển nhà'),
  job('postal_worker', ['transport_postal_warehousing'], 'Nhân viên phân loại thư / bưu điện', 'Mail sorter / postal worker', 'australia post bưu điện'),
  job('baggage_handler', ['transport_postal_warehousing'], 'Nhân viên bốc xếp hành lý sân bay', 'Baggage handler / airport ground crew', 'airport sân bay'),
  job('despatch_clerk', ['transport_postal_warehousing'], 'Nhân viên giấy tờ xuất nhập kho', 'Despatch or receiving clerk', 'dispatch receiving'),
  // J — Information Media and Telecommunications
  job('telecommunications_technician', ['information_media_telecommunications'], 'Kỹ thuật viên viễn thông / NBN', 'Telecommunications or NBN technician', 'cable cáp'),
  // K — Financial and Insurance Services
  job('finance_customer_service', ['financial_insurance'], 'Nhân viên ngân hàng / bảo hiểm', 'Bank or insurance customer service officer', 'teller claims'),
  // L — Rental, Hiring and Real Estate Services
  job('property_manager', ['rental_hiring_real_estate'], 'Quản lý nhà cho thuê', 'Property manager', 'cho thuê'),
  job('real_estate_agent', ['rental_hiring_real_estate'], 'Nhân viên môi giới bất động sản', 'Real estate sales agent', 'agent'),
  // M — Professional, Scientific and Technical Services
  job('accountant', ['professional_scientific_technical'], 'Kế toán viên', 'Accountant', 'tax thuế'),
  job('bookkeeper', ['professional_scientific_technical'], 'Nhân viên sổ sách / kế toán lương', 'Bookkeeper / payroll clerk', 'payroll lương sổ sách'),
  job('software_developer', ['professional_scientific_technical', 'information_media_telecommunications'], 'Lập trình viên', 'Software developer / programmer', 'developer programmer lập trình code'),
  job('it_support', ['professional_scientific_technical'], 'Kỹ thuật viên hỗ trợ IT', 'IT support technician', 'helpdesk'),
  job('engineer', ['professional_scientific_technical'], 'Kỹ sư', 'Engineer', 'civil mechanical'),
  job('interpreter_translator', ['professional_scientific_technical'], 'Thông dịch viên / biên dịch viên', 'Interpreter / translator', 'naati phiên dịch'),
  job('lawyer_paralegal', ['professional_scientific_technical'], 'Luật sư / trợ lý pháp lý', 'Lawyer / paralegal', 'legal'),
  job('graphic_designer', ['professional_scientific_technical'], 'Nhà thiết kế đồ họa / web', 'Graphic or web designer', 'thiết kế'),
  job('marketing_officer', ['professional_scientific_technical'], 'Nhân viên marketing / mạng xã hội', 'Marketing or social media officer', 'social media facebook tiếp thị'),
  job('photographer', ['professional_scientific_technical', 'arts_recreation'], 'Thợ chụp ảnh', 'Photographer', 'photo chụp ảnh camera'),
  // N — Administrative and Support Services
  job('commercial_cleaner', ['administrative_support'], 'Nhân viên vệ sinh (văn phòng, tòa nhà)', 'Cleaner (commercial / office)', 'commercial cleaner office building'),
  job('domestic_cleaner', ['administrative_support'], 'Nhân viên dọn dẹp nhà ở', 'Domestic / house cleaner', 'house cleaning dọn nhà giúp việc airtasker'),
  job('gardener', ['administrative_support', 'construction'], 'Người làm vườn / chăm sóc cảnh quan', 'Gardener / landscaper', 'lawn mowing cắt cỏ landscape cảnh quan sân vườn'),
  job('call_centre_operator', ['administrative_support'], 'Nhân viên tổng đài / chăm sóc khách hàng', 'Call centre / customer service operator', 'call center customer service'),
  job('admin_assistant', ['administrative_support'], 'Trợ lý hành chính / lễ tân văn phòng', 'Administrative assistant / office receptionist', 'admin receptionist lễ tân'),
  job('data_entry_operator', ['administrative_support'], 'Nhân viên nhập liệu', 'Data entry operator', 'data'),
  job('labour_hire_worker', ['administrative_support'], 'Lao động qua công ty cung ứng nhân sự', 'Labour hire / agency worker (any job)', 'casual pool'),
  job('telemarketer', ['administrative_support'], 'Nhân viên bán hàng qua điện thoại / tận nhà', 'Telemarketer / door-to-door salesperson', 'sales door to door bán hàng tận nhà'),
  // O — Public Administration and Safety
  job('security_guard', ['public_administration_safety'], 'Nhân viên bảo vệ', 'Security officer / guard', 'guard'),
  job('crowd_controller', ['public_administration_safety', 'arts_recreation'], 'Nhân viên bảo vệ sự kiện / quán bar', 'Crowd controller', 'bouncer venue'),
  // P — Education and Training
  job('tutor', ['education_training'], 'Gia sư', 'Tutor', 'dạy kèm'),
  job('teacher', ['education_training'], 'Giáo viên', 'Teacher', 'giáo viên'),
  job('education_aide', ['education_training'], 'Trợ giảng', 'Teacher’s aide / education assistant', 'teacher aide'),
  // Q — Health Care and Social Assistance
  job('aged_care_worker', ['health_care_social_assistance'], 'Nhân viên chăm sóc người cao tuổi', 'Aged care worker / personal care assistant', 'chăm sóc người già pca'),
  job('care_team_leader', ['health_care_social_assistance'], 'Trưởng ca chăm sóc', 'Care team leader', 'team leader supervisor'),
  job('disability_support_worker', ['health_care_social_assistance'], 'Nhân viên hỗ trợ người khuyết tật', 'Disability support worker', 'khuyết tật support worker'),
  job('home_care_worker', ['health_care_social_assistance'], 'Nhân viên chăm sóc tại nhà', 'Home care / community support worker', 'home care chăm sóc tại nhà'),
  job('childcare_worker', ['health_care_social_assistance', 'education_training'], 'Nhân viên chăm sóc trẻ / giáo viên mầm non', 'Childcare worker / early childhood educator', 'daycare mẫu giáo mầm non'),
  job('nanny', ['health_care_social_assistance'], 'Người giữ trẻ tại nhà / au pair', 'Nanny / au pair', 'babysitter giữ trẻ trông trẻ'),
  job('assistant_in_nursing', ['health_care_social_assistance'], 'Trợ lý điều dưỡng (AIN)', 'Assistant in nursing (AIN)', 'ain'),
  job('nurse', ['health_care_social_assistance'], 'Y tá / điều dưỡng', 'Registered or enrolled nurse', 'rn en'),
  job('hospital_orderly', ['health_care_social_assistance'], 'Nhân viên hộ lý bệnh viện', 'Hospital orderly / patient services assistant', 'hộ lý wardsperson'),
  job('medical_receptionist', ['health_care_social_assistance'], 'Lễ tân phòng khám / nha khoa', 'Medical or dental receptionist', 'clinic phòng khám gp dentist nha khoa'),
  job('community_worker', ['health_care_social_assistance'], 'Nhân viên công tác xã hội / cộng đồng', 'Community or social worker', 'social work xã hội cộng đồng'),
  job('doctor', ['health_care_social_assistance'], 'Bác sĩ', 'Doctor / medical practitioner', 'gp'),
  job('pharmacist', ['health_care_social_assistance', 'retail_trade'], 'Dược sĩ', 'Pharmacist', 'pharmacy nhà thuốc'),
  // R — Arts and Recreation Services
  job('fitness_instructor', ['arts_recreation'], 'Huấn luyện viên thể hình / dạy bơi', 'Fitness instructor / swim teacher', 'personal trainer pt bơi'),
  job('gaming_attendant', ['arts_recreation'], 'Nhân viên sòng bạc / khu máy chơi', 'Gaming or casino attendant', 'pokies sòng bạc'),
  job('venue_event_staff', ['arts_recreation'], 'Nhân viên sự kiện / địa điểm giải trí', 'Event or venue staff', 'stadium'),
  // S — Other Services
  job('nail_technician', ['other_services'], 'Thợ làm móng (thợ nail)', 'Nail technician', 'manicure pedicure'),
  job('beauty_therapist', ['other_services'], 'Kỹ thuật viên thẩm mỹ (mi, chân mày, wax)', 'Beauty therapist (lashes, brows, waxing)', 'spa lash mi'),
  job('hairdresser', ['other_services'], 'Thợ làm tóc / thợ cắt tóc', 'Hairdresser / barber', 'barber cắt tóc'),
  job('massage_therapist', ['other_services'], 'Kỹ thuật viên massage', 'Massage therapist', 'mát xa spa'),
  job('motor_mechanic', ['other_services'], 'Thợ sửa xe ô tô', 'Motor mechanic', 'sửa xe garage ô tô'),
  job('car_detailer', ['other_services'], 'Nhân viên rửa xe / chăm sóc xe', 'Car wash attendant / car detailer', 'car wash rửa xe'),
  job('phone_repairer', ['other_services'], 'Thợ sửa điện thoại / đồ điện tử', 'Phone or electronics repairer', 'sửa điện thoại'),
  job('laundry_worker', ['other_services'], 'Công nhân giặt ủi', 'Laundry or dry-cleaning worker', 'giặt ủi'),
];

const occupationIndex = new Map(occupations.map(item => [item.key, item]));

export const isIndustryCode = (value: unknown): value is IndustryCode => typeof value === 'string' && industryIndex.has(value as IndustryCode);
export const isOccupationKey = (value: unknown): value is string => typeof value === 'string' && occupationIndex.has(value);
export const findIndustry = (key: string | undefined) => (key ? industryIndex.get(key as IndustryCode) : undefined);
export const findOccupation = (key: string | undefined) => (key ? occupationIndex.get(key) : undefined);

export const otherLabel: Localized = { vi: 'Khác (vui lòng ghi rõ)', en: 'Other (please specify)' };
const otherPrefix: Localized = { vi: 'Khác', en: 'Other' };

export type SavedChoice = { value?: string; other: string };

/** A list key, "other" with the person's own words, or free text from an older draft (treated as "other"). */
function savedChoice(value: string | undefined, otherText: string | undefined, isKnown: (value: string) => boolean): SavedChoice {
  if (!value) return { value: undefined, other: '' };
  if (value === OTHER_CHOICE) return { value: OTHER_CHOICE, other: otherText ?? '' };
  if (isKnown(value)) return { value, other: '' };
  return { value: OTHER_CHOICE, other: value };
}

type Profile = CaseFile['profile'];
export const industryChoice = (profile: Profile) => savedChoice(profile.industry, profile.industryOther, isIndustryCode);
export const occupationChoice = (profile: Profile) => savedChoice(profile.role, profile.roleOther, isOccupationKey);

function describe(choice: SavedChoice, label: Localized | undefined, language: Language): string | undefined {
  if (!choice.value) return undefined;
  if (choice.value !== OTHER_CHOICE) return label?.[language];
  const own = choice.other.trim();
  return own ? `${otherPrefix[language]}: ${own}` : otherLabel[language];
}

/** Display text for summaries and exports, in the requested language. */
export const industryText = (profile: Profile, language: Language) => describe(industryChoice(profile), findIndustry(profile.industry)?.label, language);
export const occupationText = (profile: Profile, language: Language) => describe(occupationChoice(profile), findOccupation(profile.role)?.label, language);

/** Only the words a person typed themselves (an "Other" answer or an older free-text draft). */
export const workFreeText = (profile: Profile) => [industryChoice(profile).other, occupationChoice(profile).other].filter(Boolean);

export interface OccupationGroup { id: string; industry: IndustryCode; preferred: boolean; occupations: Occupation[] }

/** Jobs grouped by their main industry. Jobs in the selected industry come first; every other job stays searchable. */
export function occupationGroups(selectedIndustry?: string): OccupationGroup[] {
  const preferredCode = isIndustryCode(selectedIndustry) ? selectedIndustry : undefined;
  const preferred = preferredCode ? occupations.filter(item => item.industries.includes(preferredCode)) : [];
  const rest = occupations.filter(item => !preferred.includes(item));
  const grouped = industries
    .map(item => ({ id: item.key, industry: item.key, preferred: false, occupations: rest.filter(occupation => occupation.industries[0] === item.key) }))
    .filter(group => group.occupations.length);
  return preferredCode && preferred.length ? [{ id: `preferred-${preferredCode}`, industry: preferredCode, preferred: true, occupations: preferred }, ...grouped] : grouped;
}
