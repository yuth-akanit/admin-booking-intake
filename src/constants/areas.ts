/**
 * Master Dictionary for Area Label => AreaKey mapping.
 * Used for Thai-to-English/System key normalization.
 */
export const AREA_MAPPINGS: Record<string, string> = {
  // สมุทรปราการ (Samut Prakan)
  "บางพลี": "spk_bangphli",
  "บางแก้ว": "spk_bangkaeo",
  "บางโฉลง": "spk_bangchalong",
  "บางเสาธง": "spk_bangsao_thong",
  "บางบ่อ": "spk_bangbo",
  "ราชาเทวะ": "spk_rachathewa",
  "ศรีนครินทร์": "spk_srinakarin",
  "เทพารักษ์": "spk_thepharak",
  "กิ่งแก้ว": "spk_kingkaew",
  "สุวรรณภูมิ": "spk_suvarnabhumi",
  
  // กรุงเทพฯ (Bangkok)
  "บางนา": "bkk_bangna",
  "ประเวศ": "bkk_prawet",
  "สวนหลวง": "bkk_suanluang",
  "ลาซาล.แบริ่ง": "bkk_lasalle",
  "อ่อนนุช": "bkk_onnut",
  "ลาดกระบัง": "bkk_ladkrabang",
  "สุขุมวิท": "bkk_sukhumvit",
  
  // อื่นๆ
  "อื่นๆ (Other)": "other"
};

export const AREA_LABELS = Object.keys(AREA_MAPPINGS);
