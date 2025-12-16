'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useLineUser } from '@/hooks/useLineUser';

interface DiseaseInfo {
  name: string;
  category: string;
  symptoms: string;
  causes: string;
  treatment: string;
  prevention: string;
  icon: string;
}

const DISEASE_DATA: DiseaseInfo[] = [
  {
    name: 'โรคเอโรโมนัส (Motile Aeromonas Septicemia)',
    category: 'แบคทีเรีย',
    icon: '🦠',
    symptoms: `• ปลามีแผลเลือดออกบริเวณตัว ครีบ และหาง
• ผิวหนังมีจุดแดง จุดเลือดออก
• ท้องบวม น้ำในช่องท้อง
• ตาโปน ตาบวม
• เหงือกซีด เป็นตุ่มชมพู
• ครีบและหางอักเสบ ขาดเป็นรอยหยัก
• ปลาว่ายผิดปกติ สูญเสียการทรงตัว
• อาจมีแผลเน่าลึกถึงเนื้อเยื่อใต้ผิวหนัง`,
    causes: `สาเหตุ: เชื้อแบคทีเรีย Aeromonas hydrophila และ A. sobria
ปัจจัยเสี่ยง:
• คุณภาพน้ำไม่ดี (แอมโมเนียสูง, ออกซิเจนต่ำ)
• ความหนาแน่นของปลามากเกินไป
• อุณหภูมิน้ำผันแปร (20-30°C เหมาะกับเชื้อ)
• ปลาได้รับบาดเจ็บ ผิวหนังถูกทำลาย
• ปลามีภูมิต้านทานต่ำจากการขาดอาหาร`,
    treatment: `การรักษาเบื้องต้น:
1. ปรับปรุงคุณภาพน้ำทันที
   - เปลี่ยนถ่ายน้ำ 30-50%
   - เพิ่มออกซิเจนละลายน้ำ
   - ลดความหนาแน่นของปลา

2. การใช้ยาฆ่าเชื้อ (ต้องมีใบสั่งสัตวแพทย์):
   - Oxytetracycline 50-75 mg/kg body weight
   - ผสมในอาหาร วันละ 1 ครั้ง เป็นเวลา 7-10 วัน
   - หรือ Amoxicillin 80 mg/kg body weight

3. แช่น้ำยาฆ่าเชื้อ:
   - น้ำมะนาว 20-25 ppm นาน 30-60 นาที
   - โพวิโดน-ไอโอดีน 3-5 ppm นาน 15-20 นาที
   - Potassium permanganate 2-4 ppm

4. หยุดให้อาหาร 1-2 วัน แล้วค่อยให้อาหารแบบค่อยเป็นค่อยไป`,
    prevention: `มาตรการป้องกัน:
• รักษาคุณภาพน้ำให้ดีอยู่เสมอ
• ตรวจวัดออกซิเจนละลายน้ำ (>5 mg/L)
• หลีกเลี่ยงการบาดเจ็บของปลาขณะจับจ่าย
• ลดความหนาแน่นการเลี้ยงให้เหมาะสม (50-100 ตัว/ตร.ม.)
• ให้อาหารที่มีคุณภาพและเพียงพอ
• ฉีดวัคซีนป้องกัน (ในฟาร์มขนาดใหญ่)
• กักกันปลาใหม่ก่อนนำลงบ่อ 7-14 วัน`,
  },
  {
    name: 'โรคเอ็ดเวิดส์ซิเอลลา (Edwardsiellosis)',
    category: 'แบคทีเรีย',
    icon: '🦠',
    symptoms: `• ปลาซึมเฉา ไม่ค่อยกินอาหาร
• มีแผลเป็นหลุมลึกบริเวณศีรษะ หลัง
• ผิวหนังสีคล้ำ มีจุดแดงเล็กๆ
• ครีบและหางขาดหรือเน่า
• ท้องบวม มีน้ำในช่องท้อง
• ตาโปน มักมีเลือดออกรอบดวงตา
• อาจมีเนื้อเยื่อสมองบวม (กรณีรุนแรง)
• อัตราการตายสูงในลูกปลา (อาจถึง 80%)`,
    causes: `สาเหตุ: เชื้อแบคทีเรีย Edwardsiella ictaluri และ E. tarda
ปัจจัยเสี่ยง:
• อุณหภูมิน้ำ 25-28°C
• ความเค็มของน้ำต่ำ
• ปลาอยู่ในสภาวะเครียด
• คุณภาพน้ำเลว (แอมโมเนีย, ไนไตรท์สูง)
• การขนย้ายปลา`,
    treatment: `การรักษา:
1. แยกปลาป่วยออกจากฝูง

2. ยาปฏิชีวนะ (ต้องมีใบสั่งสัตวแพทย์):
   - Florfenicol 10-15 mg/kg body weight
   - ผสมในอาหาร วันละ 1 ครั้ง เป็นเวลา 10 วัน
   - หรือ Sulfadimethoxine + Ormetoprim

3. ปรับปรุงสภาพแวดล้อม:
   - เปลี่ยนถ่ายน้ำบ่อยขึ้น
   - เพิ่มการเติมอากาศ
   - ลดปริมาณอาหาร 50%

4. เพิ่มวิตามิน C และ E ในอาหาร

5. ใช้น้ำมะนาว 20 ppm แช่ 1 ชั่วโมง ทุก 3 วัน`,
    prevention: `มาตรการป้องกัน:
• หลีกเลี่ยงความเครียดของปลา
• รักษาอุณหภูมิน้ำให้คงที่
• ตรวจคุณภาพน้ำสัปดาห์ละ 1 ครั้ง
• ใช้พันธุ์ปลาที่มีภูมิต้านทานดี
• ฉีดวัคซีนป้องกัน (สำหรับฟาร์มขนาดใหญ่)
• กำจัดปลาป่วยและซากปลาทันที
• ฆ่าเชื้อบ่อและอุปกรณ์หลังจบรอบการเลี้ยง`,
  },
  {
    name: 'โรคสเตรปโตคอคคัส (Streptococcosis)',
    category: 'แบคทีเรีย',
    icon: '🦠',
    symptoms: `• ปลาว่ายหมุนวน วนเวียนผิดปกติ
• เบื่อการกินอาหาร ซึมเซา
• ตาบวม ตาโปน ตาพร่ามัว หรือตาเลือดออก
• ท้องบวมโต มีน้ำในช่องท้อง
• ผิวหนังและเหงือกมีจุดเลือดออก
• เกล็ดหลุดง่าย ผิวหนังขาดออก
• สมองอักเสบ พฤติกรรมผิดปกติ
• ตับและไตบวม มีเลือดออก
• อัตราการตายสูงมาก (30-50%)`,
    causes: `สาเหตุ: เชื้อแบคทีเรีย Streptococcus agalactiae และ S. iniae
ปัจจัยเสี่ยง:
• อุณหภูมิน้ำสูง (28-32°C)
• ความหนาแน่นของปลาสูง
• ปลามีภูมิต้านทานต่ำ
• ได้รับบาดเจ็บระหว่างการจับจ่าย
• เลี้ยงปลาหลายช่วงวัยปนกัน`,
    treatment: `การรักษา:
1. ใช้ยาปฏิชีวนะทันที (ต้องมีใบสั่งสัตวแพทย์):
   - Erythromycin 50-100 mg/kg body weight
   - ให้ผ่านอาหาร วันละ 1 ครั้ง เป็นเวลา 10-14 วัน
   - หรือ Ampicillin 100 mg/kg

2. ลดอุณหภูมิน้ำลง 2-3°C (ถ้าทำได้)

3. เพิ่มการเติมอากาศให้สูงสุด

4. ลดความหนาแน่นของปลาลง 30-40%

5. ให้อาหารที่ผสมวิตามินเสริม โดยเฉพาะวิตามิน C

6. แช่น้ำด่าง (CaCO3) 200 ppm ทุก 3 วัน

⚠️ คำเตือน: โรคนี้รักษายาก ควรเน้นการป้องกัน`,
    prevention: `มาตรการป้องกัน:
• ฉีดวัคซีนป้องกันโรคสเตรปโตคอคคัส
• คัดแยกปลาตามขนาด ไม่เลี้ยงปนกัน
• รักษาความหนาแน่นไม่เกิน 80 ตัว/ตร.ม.
• ควบคุมอุณหภูมิน้ำไม่ให้สูงเกินไป
• หลีกเลี่ยงการบาดเจ็บของปลา
• ตักปลาป่วยออกทันที
• ฆ่าเชื้อบ่อด้วยคลอรีน 100 ppm หลังจบรอบ
• เพิ่มภูมิต้านทานด้วยอาหารคุณภาพสูง`,
  },
  {
    name: 'โรคจุดขาว (White Spot Disease)',
    category: 'ปรสิต',
    icon: '🔬',
    symptoms: `• มีจุดขาวขนาดเล็กเหมือนเกลือ บนตัว ครีบ เหงือก
• ปลาเสียดสีตัวกับพื้นบ่อหรือผนังบ่อ
• ครีบชีบๆ แบมๆ กระตุก
• ผลิตเมือกมากผิดปกติ ผิวหนังมัว
• หายใจเร็ว หายใจติดขัด
• เบื่ออาหาร น้ำหนักลด
• เหงือกอักเสบ บวม
• จุดขาวอาจแพร่หนาแน่นทั่วตัว
• อัตราการตายสูงถ้าไม่รักษา`,
    causes: `สาเหตุ: ปรสิตโปรโตซัว Ichthyophthirius multifiliis
ปัจจัยเสี่ยง:
• อุณหภูมิน้ำต่ำ (15-25°C)
• คุณภาพน้ำเลว
• ปลามีภูมิต้านทานต่ำ
• ความหนาแน่นของปลาสูง
• การนำปลาหรืออุปกรณ์ปนเปื้อนเข้ามา`,
    treatment: `การรักษา:
1. เพิ่มอุณหภูมิน้ำเป็น 30-32°C (ช้าๆ 1-2°C/วัน)
   - ปรสิตจะหลุดและตายเร็วขึ้นในน้ำอุ่น

2. ใช้น้ำเกลือบริสุทธิ์ (NaCl):
   - แช่น้ำเกลือ 10-15 ppt (1-1.5%)
   - นาน 15-30 นาที ทุก 2-3 วัน
   - รักษาต่อเนื่อง 3-4 ครั้ง

3. ใช้ Formalin 15-25 ppm แช่นาน 30-60 นาที
   (เปิดเครื่องเติมอากาศเต็มที่)

4. ใช้ Malachite Green 0.1-0.15 ppm
   - แช่ในบ่อ 3-5 วัน
   - เปลี่ยนน้ำบางส่วนทุก 2 วัน

5. ยาไอโซคลูไซด์ตามคำแนะนำบนฉลาก

6. เปลี่ยนถ่ายน้ำบ่อย 20-30% ทุกวัน

⚠️ หมายเหตุ: ต้องรักษาต่อเนื่อง เพราะปรสิตมีวงจรชีวิต`,
    prevention: `มาตรการป้องกัน:
• กักกันปลาใหม่ 14-21 วัน ก่อนนำลงบ่อ
• ตรวจดูจุดขาวอย่างละเอียดก่อนซื้อปลา
• ฆ่าเชื้อบ่อและอุปกรณ์ก่อนใช้ใหม่
• หลีกเลี่ยงอุณหภูมิน้ำต่ำ
• รักษาคุณภาพน้ำให้ดี
• ไม่ใช้อุปกรณ์ร่วมกับบ่ออื่นที่มีปัญหา
• ให้อาหารที่มีคุณค่าทางโภชนาการสูง
• ใช้น้ำมะนาวแช่ป้องกันทุก 1-2 สัปดาห์`,
  },
  {
    name: 'โรคหนอนสมอ (Anchor Worm)',
    category: 'ปรสิต',
    icon: '🪱',
    symptoms: `• เห็นปรสิตรูปแท่งติดบนผิวหนังชัดเจน
• ส่วนหัวฝังลึกในชั้นผิวหนัง ส่วนท้ายยื่นออกมา
• บริเวณที่ติดปรสิตมีแผลเป็นหลุมแดง
• มีการอักเสบรอบๆ บริเวณที่ติดปรสิต
• ผิวหนังเป็นแผล เลือดออก
• ปลาเสียดสีตัวบ่อยๆ
• เบื่ออาหาร ผอม ซูบ
• ติดเชื้อแบคทีเรียแทรกซ้อน
• พบได้ทั้งตัว ครีบ และเหงือก`,
    causes: `สาเหตุ: ปรสิตไส้เดือนฝอย Lernaea spp.
ปัจจัยเสี่ยง:
• น้ำนิ่ง ไหลเวียนน้อย
• คุณภาพน้ำไม่ดี มีสารอินทรีย์สูง
• ฤดูร้อน อุณหภูมิ 25-30°C
• นำปลาปนเปื้อนเข้ามา
• ความหนาแน่นของปลามาก`,
    treatment: `การรักษา:
1. ถอนปรสิตออกด้วยมือ (กรณีปรสิตไม่มาก):
   - ใช้ปากคีบถอนตัวปรสิตทั้งตัว
   - ระวังอย่าให้หัวหลุดค้างในเนื้อ
   - ทายาฆ่าเชื้อ (โพวิโดน-ไอโอดีน)

2. แช่น้ำเกลือ 2-3% นาน 30-60 นาที

3. ใช้ Trichlorfon (Masoten, Neguvon):
   - 0.25-0.5 ppm แช่ในบ่อ
   - ทำซ้ำทุก 7 วัน อย่างน้อย 3 ครั้ง
   - เพื่อฆ่าปรสิตตัวอ่อนที่ฟักใหม่

4. ใช้ Potassium permanganate 2 ppm แช่ 30 นาที

5. ใช้น้ำมะนาว 20-25 ppm

6. ใช้ยาถ่ายพยาธิตามคำแนะนำสัตวแพทย์

7. เปลี่ยนถ่ายน้ำ 30-50% ทุก 3 วัน`,
    prevention: `มาตรการป้องกัน:
• ตรวจสอบปลาใหม่ก่อนนำเข้าฟาร์ม
• กักกันปลาใหม่ 14-21 วัน
• ไม่ซื้อปลาจากแหล่งที่มีปัญหาหนอนสมอ
• เปลี่ยนถ่ายน้ำสม่ำเสมอ
• รักษาคุณภาพน้ำให้ดี
• เพิ่มการไหลเวียนของน้ำ
• ทำความสะอาดบ่อและอุปกรณ์เป็นประจำ
• แช่น้ำมะนาวเป็นประจำ ทุก 2 สัปดาห์
• ใช้ปูนขาวฆ่าเชื้อพื้นบ่อระหว่างรอบการเลี้ยง`,
  },
  {
    name: 'โรคเหงือกเน่า (Columnaris Disease)',
    category: 'แบคทีเรีย',
    icon: '🦠',
    symptoms: `• เหงือกเป็นสีเหลือง ขาวขุ่น หรือเทา
• เหงือกเน่า บางส่วนหลุดลอก
• ริมปากมีแผล เป็นสีขาว
• ครีบเน่า ขาดเป็นรอยหยัก
• ปากและเหงือกมีเยื่อบางๆ คล้ายฝ้าย
• หายใจเร็ว หายใจลำบาก
• ผิวหนังมีแผลเป็นขุย สีขาวเทา
• เบื่ออาหาร น้ำหนักลด
• อัตราการตายสูง โดยเฉพาะลูกปลา`,
    causes: `สาเหตุ: เชื้อแบคทีเรีย Flavobacterium columnare
ปัจจัยเสี่ยง:
• อุณหภูมิน้ำ 20-32°C (เหมาะที่สุด 25-28°C)
• pH สูง (7.5-8.5)
• ความหนาแน่นของปลาสูง
• คุณภาพน้ำไม่ดี สารอินทรีย์มาก
• ปลาบาดเจ็บ ผิวหนังถูกทำลาย
• ปลาขาดวิตามิน C`,
    treatment: `การรักษา:
1. ปรับปรุงคุณภาพน้ำทันที:
   - เปลี่ยนถ่ายน้ำ 50% ทุกวัน
   - เพิ่มออกซิเจนละลายน้ำ
   - ลด pH ลงเล็กน้อย (7.0-7.5)

2. ยาปฏิชีวนะ (ต้องมีใบสั่งสัตวแพทย์):
   - Oxytetracycline 50-75 mg/kg
   - ผสมในอาหาร 7-10 วัน
   - หรือ Florfenicol 10 mg/kg

3. แช่น้ำยาฆ่าเชื้อ:
   - Potassium permanganate 2-3 ppm นาน 30 นาที
   - น้ำมะนาว 20-25 ppm นาน 1 ชั่วโมง
   - Copper sulfate 0.5-0.8 ppm (ระวังพิษ)

4. เพิ่มเกลือบริสุทธิ์ 3-5 ppt ในบ่อ

5. เสริมวิตามิน C และ E ในอาหาร

6. ลดความหนาแน่นของปลาลง 50%`,
    prevention: `มาตรการป้องกัน:
• รักษาคุณภาพน้ำให้อยู่ในเกณฑ์ดีเสมอ
• หลีกเลี่ยงการบาดเจ็บของปลา
• ลดความหนาแน่นการเลี้ยง
• ให้อาหารคุณภาพดี มีวิตามินครบ
• หลีกเลี่ยงการเปลี่ยนแปลงอุณหภูมิกระทันหัน
• ควบคุม pH ให้อยู่ระหว่าง 6.5-7.5
• ฆ่าเชื้อบ่อระหว่างรอบการเลี้ยง
• กักกันปลาใหม่ก่อนนำลงบ่อหลัก`,
  },
  {
    name: 'โรคขาดสารอาหาร (Nutritional Deficiency)',
    category: 'โภชนาการ',
    icon: '🍽️',
    symptoms: `• ปลาหัวโต ตัวลีบผอม
• ครีบมีสีเหลืองขุ่น โดยเฉพาะทั้ง 2 ข้าง
• กระดูกสันหลังโก่ง งอผิดรูป
• ตาโปนหรือตาบอด (ขาดวิตามิน A)
• เกล็ดหลุดง่าย ผิวหนังแห้ง
• เจริญเติบโตช้า ขนาดไม่เท่ากัน
• ภูมิต้านทานต่ำ ติดเชื้อง่าย
• ตับอ่อนแอ สีซีดหรือมีไขมันมาก
• อาการซูบผอมแม้กินอาหารปกติ`,
    causes: `สาเหตุ:
• ขาดโปรตีน หรือกรดอะมิโนที่จำเป็น
• ขาดวิตามิน (A, C, E, B-complex)
• ขาดแร่ธาตุ (Ca, P, Fe, Zn, Mn)
• สัดส่วนพลังงาน:โปรตีนไม่เหมาะสม
• ไขมันไม่เพียงพอ หรือไขมันเสื่อมคุณภาพ
• อาหารเก็บนานเกินไป วิตามินสลายตัว
• อาหารผสมไม่สมดุล`,
    treatment: `การแก้ไข:
1. ปรับปรุงสูตรอาหาร:
   - เพิ่มสัดส่วนโปรตีน 30-35%
   - ใช้โปรตีนคุณภาพดี (ปลาป่น, ถั่วเหลือง)
   - เพิ่มพลังงาน (ข้าวโพด, รำข้าว)
   - อัตราส่วนพลังงาน:โปรตีน = 8-10 kcal/g protein

2. เสริมวิตามินและแร่ธาตุ:
   - วิตามิน C 200-500 mg/kg อาหาร
   - วิตามิน E 100-200 mg/kg
   - วิตามินรวม B-complex
   - แคลเซียมและฟอสฟอรัส Ca:P = 1:1 ถึง 2:1

3. เพิ่มไขมันคุณภาพดี 5-8%
   - น้ำมันปลา มี Omega-3
   - น้ำมันถั่วเหลือง

4. ใช้อาหารสดเสริม:
   - ไส้เดือน, หอยเชอรี่ (โปรตีนสูง)
   - ผักต่างๆ (วิตามิน-แร่ธาตุ)

5. เปลี่ยนใช้อาหารสำเร็จรูปคุณภาดี
   - ตรวจสอบฉลากโภชนาการ
   - เลือกของมีวันหมดอายุยาว`,
    prevention: `มาตรการป้องกัน:
• เลือกซื้ออาหารคุณภาพจากโรงงานมาตรฐาน
• เก็บอาหารในที่แห้ง เย็น ไม่ชื้น
• ไม่ซื้ออาหารมากเกินไป (ใช้ภายใน 1-2 เดือน)
• ให้อาหารหลากหลาย สลับประเภท
• เสริมวิตามินทุก 2 สัปดาห์
• ตรวจสอบอัตราการเจริญเติบโตสม่ำเสมอ
• ปรับสูตรอาหารตามช่วงอายุของปลา
• หลีกเลี่ยงการใช้อาหารถูกเหลือทิ้ง`,
  },
  {
    name: 'โรคเชื้อรา (Saprolegniasis)',
    category: 'เชื้อรา',
    icon: '🍄',
    symptoms: `• มีเส้นใยสีขาวปุยๆ คล้ายสำลี
• ขนแบะแบะบนผิวหนัง ครีบ ปาก
• เริ่มจากแผลหรือจุดบาดเจ็บ
• แพร่กระจายเป็นวงกว้างรวดเร็ว
• ผิวหนังเน่า ลอกเป็นแผ่นใหญ่
• เหงือกติดเชื้อรา หายใจลำบาก
• ไข่ปลาเน่าจากเชื้อรา
• ปลาซบเซา ไม่ค่อยขยับ
• มักเกิดร่วมกับบาดแผล`,
    causes: `สาเหตุ: เชื้อรา Saprolegnia spp. และ Achlya spp.
ปัจจัยเสี่ยง:
• อุณหภูมิน้ำต่ำ 15-25°C
• คุณภาพน้ำไม่ดี สารอินทรีย์สูง
• ปลามีแผล บาดเจ็บ
• ความหนาแน่นสูง
• ปลาอ่อนแอ ภูมิต้านทานต่ำ
• การขนย้ายปลา`,
    treatment: `การรักษา:
1. แช่น้ำเกลือบริสุทธิ์:
   - 10-15 ppt (1-1.5%) นาน 15-30 นาที
   - หรือ 5 ppt แช่ในบ่อ 5-7 วัน

2. ใช้ Malachite Green 0.1-0.15 ppm
   - แช่ 30-60 นาที หรือในบ่อ 3-5 วัน
   - ทำซ้ำทุก 3 วัน
   (⚠️ ห้ามใช้กับปลาที่จะจำหน่าย ภายใน 21 วัน)

3. ใช้ Hydrogen peroxide 250-500 ppm
   - แช่ 10-15 นาที

4. ใช้น้ำมะนาว 25-30 ppm แช่ 1 ชั่วโมง

5. โพวิโดน-ไอโอดีน 5 ppm แช่ 15 นาที

6. เพิ่มอุณหภูมิน้ำเป็น 28-30°C (ถ้าทำได้)

7. ปรับปรุงคุณภาพน้ำ:
   - เปลี่ยนถ่ายน้ำ 30-50%
   - เพิ่มการเติมอากาศ

8. ใช้ยาฆ่าเชื้อราตามคำแนะนำสัตวแพทย์`,
    prevention: `มาตรการป้องกัน:
• หลีกเลี่ยงการบาดเจ็บของปลา
• รักษาอุณหภูมิน้ำให้เหมาะสม (>25°C)
• รักษาคุณภาพน้ำให้ดี
• ลดความหนาแน่นการเลี้ยง
• ฆ่าเชื้อไข่ปลาด้วย Malachite Green
• กำจัดซากปลาและสิ่งเน่าเสียทันที
• แช่น้ำมะนาวป้องกันสัปดาห์ละครั้ง
• ฆ่าเชื้อบ่อและอุปกรณ์เป็นประจำ
• เลือกใช้พันธุ์ปลาที่แข็งแรง`,
  },
  {
    name: 'อาการเครียด (Stress Syndrome)',
    category: 'สิ่งแวดล้อม',
    icon: '😰',
    symptoms: `• สีของปลาคล้ำ ดำ หรือซีดผิดปกติ
• ว่ายหนีตื่นตกใจง่าย กระโดดมาก
• ว่ายผิวน้ำ หายใจเร็ว อ้าปากหอบ
• กระจุกตัวกันที่มุมบ่อ
• เบื่ออาหาร หรือกินอาหารไม่หมด
• เจริญเติบโตช้า น้ำหนักไม่เพิ่ม
• ภูมิต้านทานต่ำ ติดโรคง่าย
• ครีบชีบๆ ไม่กาง
• พฤติกรรมผิดปกติ แปลกไป`,
    causes: `สาเหตุและปัจจัยเสี่ยง:
• คุณภาพน้ำไม่ดี (DO<3, NH3>0.1, NO2>0.5)
• อุณหภูมิน้ำผันแปรมาก (>3°C/วัน)
• ความหนาแน่นของปลาสูงเกินไป
• การขนย้ายปลา การตักจับบ่อย
• เสียงดัง แสงสว่างมากหรือน้อยเกินไป
• ขาดอาหาร หรือแข่งขันอาหารรุนแรง
• การปรากฏของนักล่า (นก, งู)
• การใช้ยาเคมีที่ไม่เหมาะสม
• การเปลี่ยนแปลงสภาพแวดล้อมกะทันหัน`,
    treatment: `การแก้ไขเบื้องต้น:
1. ระบุและแก้ไขสาเหตุทันที:
   - วัดค่าคุณภาพน้ำ (pH, DO, NH3, NO2)
   - ปรับแก้ค่าที่ผิดปกติ

2. ปรับปรุงสภาพแวดล้อม:
   - เปลี่ยนถ่ายน้ำ 30-50%
   - เพิ่มออกซิเจนละลายน้ำ >5 mg/L
   - ลดความหนาแน่นของปลาลง

3. ลดการรบกวน:
   - หยุดการจับจ่าย ขนย้าย
   - ลดเสียงและการสั่นสะเทือน
   - ปิดบังแสงแดดจัดด้วยตาข่าย

4. เสริมสารช่วยลดเครียด:
   - วิตามิน C 500-1000 mg/kg อาหาร
   - วิตามิน E 200-400 mg/kg
   - เกลือบริสุทธิ์ 3-5 ppt ในบ่อ

5. ปรับการให้อาหาร:
   - ลดปริมาณลง 30-50% ชั่วคราว
   - ให้อาหารช่วงเย็น เมื่อปลาสงบ

6. เพิ่มที่หลบซ่อน:
   - ใส่ท่อ PVC, กระถาง
   - ปลูกผักตบชวาให้ร่มเงา`,
    prevention: `มาตรการป้องกัน:
• รักษาคุณภาพน้ำให้ดีตลอดเวลา
• หลีกเลี่ยงการเปลี่ยนแปลงกะทันหัน
• ควบคุมความหนาแน่นให้เหมาะสม (50-80 ตัว/ตร.ม.)
• จัดการให้อาหารอย่างสม่ำเสมอ
• ลดการจับจ่ายปลาให้น้อยที่สุด
• ให้น้ำหนักเท่าๆ กัน ป้องกันการแย่งอาหาร
• สร้างที่หลบซ่อนในบ่อ
• ติดตั้งตาข่ายกันนก
• เลือกช่วงเวลาที่เหมาะสมในการทำงาน
• เพิ่มภูมิต้านทานด้วยอาหารคุณภาพดี
• วางแผนการจัดการล่วงหน้า`,
  },
];

interface DiseaseInfoProps {
  backHref: string;
}

type ViewMode = 'form' | 'list' | 'detail';

const SYMPTOM_TAGS = [
  'หัวโต', 'ตัวลีบ', 'ครีบเหลือง', 'ตาลึก', 'ตกใจง่าย',
  'จุดขาว', 'แผลเลือดออก', 'ตาโปน', 'ครีบเน่า', 'ผิวหนังมัว'
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'แบคทีเรีย': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  'ปรสิต': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'เชื้อรา': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'โภชนาการ': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'สิ่งแวดล้อม': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
};

export const DiseaseInfo = ({ backHref }: DiseaseInfoProps) => {
  const router = useRouter();
  const lineUser = useLineUser();
  const [mode, setMode] = useState<ViewMode>('form');
  const [selectedDisease, setSelectedDisease] = useState<DiseaseInfo | null>(null);
  const [symptomInput, setSymptomInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return objectUrl;
    });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const handleBack = () => {
    if (mode === 'detail') {
      setSelectedDisease(null);
      setMode('list');
      return;
    }
    if (mode === 'list') {
      setMode('form');
      return;
    }
    router.push(backHref);
  };

  const openDisease = (disease: DiseaseInfo) => {
    setSelectedDisease(disease);
    setMode('detail');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-10 relative">
      <div className="bg-gradient-to-r from-[#093832] to-[#0E9A67] text-white px-4 pt-8 pb-10 rounded-b-[40px] shadow-lg relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="p-1.5 rounded-full transition-all hover:bg-white/20 active:scale-95"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <div>
            <h1 className="text-xl font-bold leading-tight">
              {mode === 'detail' && selectedDisease ? selectedDisease.name : 'ข้อมูลการรักษาโรค'}
            </h1>
            {mode === 'list' && (
              <p className="text-xs text-emerald-100 mt-0.5">เลือกโรคเพื่อดูรายละเอียด</p>
            )}
            {mode === 'form' && (
              <p className="text-xs text-emerald-100 mt-0.5">ตรวจสอบสุขภาพปลาของคุณ</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-emerald-100">ยินดีต้อนรับ</p>
            <p className="text-sm font-bold">{lineUser.displayName}</p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200 shadow-md">
            <Image
              src={lineUser.pictureUrl || '/default-avatar.png'}
              alt="Profile"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="px-5 mt-8 w-full max-w-2xl mx-auto flex flex-col min-h-[calc(100vh-180px)] justify-between gap-6">
        {mode === 'form' && (
          <div className="space-y-6">
            {/* Info Card */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-5 rounded-2xl border-2 border-cyan-200 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-3xl">🩺</span>
                <div>
                  <h3 className="text-[#093832] font-bold text-base mb-1">ตรวจสอบอาการปลา</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    บันทึกอาการที่พบเพื่อช่วยในการวินิจฉัยโรค
                    หรือเลือกดูข้อมูลโรคทั้งหมดได้ด้านล่าง
                  </p>
                </div>
              </div>
            </div>

            {/* Symptom Input */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-base text-[#093832] font-semibold">
                อาการที่พบ
              </label>
              <textarea
                value={symptomInput}
                onChange={(e) => setSymptomInput(e.target.value)}
                placeholder="อธิบายอาการที่พบในปลา เช่น มีแผล, ว่ายผิดปกติ, ไม่กินอาหาร..."
                rows={3}
                className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
              />
            </div>

            {/* Symptom Tags */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-base text-[#093832] font-semibold">
                เลือกอาการด่วน
              </label>
              <div className="flex flex-wrap gap-2">
                {SYMPTOM_TAGS.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
                        active
                          ? 'bg-[#093832] text-white border-[#093832] shadow-md scale-105'
                          : 'bg-white text-[#093832] border-gray-300 hover:border-[#093832] hover:shadow-sm'
                      }`}
                    >
                      {active && '✓ '}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-base text-[#093832] font-semibold">
                รูปภาพประกอบ
              </label>
              <div className="w-full">
                <label
                  htmlFor="disease-image-input"
                  className="block w-full text-center py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-500 shadow-md hover:shadow-lg hover:from-blue-600 hover:to-indigo-600 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>ถ่ายรูป / อัปโหลดรูปปลา</span>
                  </div>
                </label>
                <input
                  id="disease-image-input"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {imagePreview && (
                  <div className="mt-4 rounded-2xl border-2 border-emerald-200 overflow-hidden shadow-lg">
                    <Image
                      src={imagePreview}
                      alt="รูปปลาที่อัปโหลด"
                      width={800}
                      height={600}
                      className="w-full h-64 object-cover"
                    />
                    <div className="bg-emerald-50 p-2 text-center">
                      <p className="text-emerald-700 text-sm font-semibold">✓ อัปโหลดสำเร็จ</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons placeholder removed to consolidate at footer */}
          </div>
        )}

        {mode === 'list' && (
          <div className="space-y-5">
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['ทั้งหมด', 'แบคทีเรีย', 'ปรสิต', 'เชื้อรา', 'โภชนาการ', 'สิ่งแวดล้อม'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#093832] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Disease List */}
            <div className="flex flex-col gap-3">
              {DISEASE_DATA.filter(
                (d) => selectedCategory === 'ทั้งหมด' || d.category === selectedCategory
              ).map((disease, index) => {
                const colors = CATEGORY_COLORS[disease.category] || CATEGORY_COLORS['สิ่งแวดล้อม'];
                return (
                  <button
                    key={index}
                    onClick={() => openDisease(disease)}
                    className={`${colors.bg} ${colors.border} border-2 p-4 rounded-2xl text-left shadow-sm hover:shadow-md transition-all hover:scale-[1.02]`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{disease.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-[#093832] font-bold text-base leading-tight mb-1">
                          {disease.name}
                        </h3>
                        <span className={`${colors.text} text-xs font-semibold px-2 py-1 rounded-full ${colors.bg}`}>
                          {disease.category}
                        </span>
                      </div>
                      <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {mode === 'detail' && selectedDisease && (
          <div className="space-y-4">
            {/* Category Badge */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl">{selectedDisease.icon}</span>
              <span
                className={`${
                  CATEGORY_COLORS[selectedDisease.category]?.text || 'text-gray-700'
                } text-sm font-bold px-3 py-1.5 rounded-full ${
                  CATEGORY_COLORS[selectedDisease.category]?.bg || 'bg-gray-100'
                } border-2 ${
                  CATEGORY_COLORS[selectedDisease.category]?.border || 'border-gray-200'
                }`}
              >
                {selectedDisease.category}
              </span>
            </div>

            {/* Symptoms */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 p-5 rounded-2xl shadow-md border-2 border-red-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🔴</span>
                <h3 className="font-bold text-red-900 text-lg">อาการที่พบ</h3>
              </div>
              <p className="text-gray-800 leading-relaxed whitespace-pre-line text-sm">
                {selectedDisease.symptoms}
              </p>
            </div>

            {/* Causes */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-5 rounded-2xl shadow-md border-2 border-amber-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">⚠️</span>
                <h3 className="font-bold text-amber-900 text-lg">สาเหตุ & ปัจจัยเสี่ยง</h3>
              </div>
              <p className="text-gray-800 leading-relaxed whitespace-pre-line text-sm">
                {selectedDisease.causes}
              </p>
            </div>

            {/* Treatment */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-2xl shadow-md border-2 border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">💊</span>
                <h3 className="font-bold text-blue-900 text-lg">วิธีการรักษา</h3>
              </div>
              <p className="text-gray-800 leading-relaxed whitespace-pre-line text-sm">
                {selectedDisease.treatment}
              </p>
            </div>

            {/* Prevention */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl shadow-md border-2 border-green-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🛡️</span>
                <h3 className="font-bold text-green-900 text-lg">การป้องกัน</h3>
              </div>
              <p className="text-gray-800 leading-relaxed whitespace-pre-line text-sm">
                {selectedDisease.prevention}
              </p>
            </div>

            {/* Warning Note */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200">
              <div className="flex gap-3 items-start">
                <span className="text-2xl">💡</span>
                <div className="flex-1">
                  <p className="text-purple-900 text-sm font-semibold mb-1">
                    คำแนะนำสำคัญ
                  </p>
                  <p className="text-purple-800 text-xs leading-relaxed">
                    หากพบอาการรุนแรงหรือไม่แน่ใจในการรักษา ควรปรึกษาสัตวแพทย์ผู้เชี่ยวชาญด้านสัตว์น้ำ
                    การใช้ยาควรเป็นไปตามคำแนะนำและขนาดที่เหมาะสม
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-auto pt-4 space-y-3">
          <button
            type="button"
            onClick={() => setMode('list')}
            className="w-full py-4 rounded-xl text-lg font-bold text-[#093832] bg-white border border-[#093832] shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <div className="flex items-center justify-center gap-2">
              <span>ดูข้อมูลโรคทั้งหมด</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push('/disease-result')}
            className="w-full py-4 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-emerald-500 to-green-600 shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-green-700 transition-all active:scale-95"
          >
            <div className="flex items-center justify-center gap-2">
              <span>วิเคราะห์ข้อมูลโรค</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};