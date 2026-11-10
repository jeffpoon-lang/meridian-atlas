(()=>{
"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const store={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const reduceMotion=(()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}})();
const W=300;

/* ---------- data: meridians ---------- */
const BR=[["子","Zǐ"],["丑","Chǒu"],["寅","Yín"],["卯","Mǎo"],["辰","Chén"],["巳","Sì"],["午","Wǔ"],["未","Wèi"],["申","Shēn"],["酉","Yǒu"],["戌","Xū"],["亥","Hài"]];
const BR_MER=["GB","LR","LU","LI","ST","SP","HT","SI","BL","KI","PC","TE"];
const M=[
 {id:"LU",zh:"手太陰肺經",s:"肺經",en:"Lung Meridian of Hand-Taiyin",es:"Lung",org:["肺","Lung"],yy:["陰","Yin"],six:["太陰","Taiyin"],limb:["手","Hand"],el:["金","Metal","metal"],pair:"LI",dir:["胸 → 手","Chest → Hand"],n:11,v:"front"},
 {id:"LI",zh:"手陽明大腸經",s:"大腸經",en:"Large Intestine Meridian of Hand-Yangming",es:"Large Intestine",org:["大腸","Large Intestine"],yy:["陽","Yang"],six:["陽明","Yangming"],limb:["手","Hand"],el:["金","Metal","metal"],pair:"LU",dir:["手 → 頭","Hand → Head"],n:20,v:"back"},
 {id:"ST",zh:"足陽明胃經",s:"胃經",en:"Stomach Meridian of Foot-Yangming",es:"Stomach",org:["胃","Stomach"],yy:["陽","Yang"],six:["陽明","Yangming"],limb:["足","Foot"],el:["土","Earth","earth"],pair:"SP",dir:["頭 → 足","Head → Foot"],n:45,v:"front"},
 {id:"SP",zh:"足太陰脾經",s:"脾經",en:"Spleen Meridian of Foot-Taiyin",es:"Spleen",org:["脾","Spleen"],yy:["陰","Yin"],six:["太陰","Taiyin"],limb:["足","Foot"],el:["土","Earth","earth"],pair:"ST",dir:["足 → 胸腹","Foot → Abdomen & chest"],n:21,v:"front"},
 {id:"HT",zh:"手少陰心經",s:"心經",en:"Heart Meridian of Hand-Shaoyin",es:"Heart",org:["心","Heart"],yy:["陰","Yin"],six:["少陰","Shaoyin"],limb:["手","Hand"],el:["火","Fire","fire"],pair:"SI",dir:["胸 → 手","Chest → Hand"],n:9,v:"front"},
 {id:"SI",zh:"手太陽小腸經",s:"小腸經",en:"Small Intestine Meridian of Hand-Taiyang",es:"Small Intestine",org:["小腸","Small Intestine"],yy:["陽","Yang"],six:["太陽","Taiyang"],limb:["手","Hand"],el:["火","Fire","fire"],pair:"HT",dir:["手 → 頭","Hand → Head"],n:19,v:"back"},
 {id:"BL",zh:"足太陽膀胱經",s:"膀胱經",en:"Bladder Meridian of Foot-Taiyang",es:"Bladder",org:["膀胱","Bladder"],yy:["陽","Yang"],six:["太陽","Taiyang"],limb:["足","Foot"],el:["水","Water","water"],pair:"KI",dir:["頭 → 足","Head → Foot"],n:67,v:"back"},
 {id:"KI",zh:"足少陰腎經",s:"腎經",en:"Kidney Meridian of Foot-Shaoyin",es:"Kidney",org:["腎","Kidney"],yy:["陰","Yin"],six:["少陰","Shaoyin"],limb:["足","Foot"],el:["水","Water","water"],pair:"BL",dir:["足 → 胸腹","Foot → Abdomen & chest"],n:27,v:"front"},
 {id:"PC",zh:"手厥陰心包經",s:"心包經",en:"Pericardium Meridian of Hand-Jueyin",es:"Pericardium",org:["心包","Pericardium"],yy:["陰","Yin"],six:["厥陰","Jueyin"],limb:["手","Hand"],el:["火","Fire","fire"],pair:"TE",dir:["胸 → 手","Chest → Hand"],n:9,v:"front"},
 {id:"TE",zh:"手少陽三焦經",s:"三焦經",en:"Triple Energizer Meridian of Hand-Shaoyang",es:"Triple Energizer",org:["三焦","Triple Energizer (Sanjiao)"],yy:["陽","Yang"],six:["少陽","Shaoyang"],limb:["手","Hand"],el:["火","Fire","fire"],pair:"PC",dir:["手 → 頭","Hand → Head"],n:23,v:"back",alias:"SJ"},
 {id:"GB",zh:"足少陽膽經",s:"膽經",en:"Gallbladder Meridian of Foot-Shaoyang",es:"Gallbladder",org:["膽","Gallbladder"],yy:["陽","Yang"],six:["少陽","Shaoyang"],limb:["足","Foot"],el:["木","Wood","wood"],pair:"LR",dir:["頭 → 足","Head → Foot"],n:44,v:"side"},
 {id:"LR",zh:"足厥陰肝經",s:"肝經",en:"Liver Meridian of Foot-Jueyin",es:"Liver",org:["肝","Liver"],yy:["陰","Yin"],six:["厥陰","Jueyin"],limb:["足","Foot"],el:["木","Wood","wood"],pair:"GB",dir:["足 → 胸腹","Foot → Abdomen & chest"],n:14,v:"front"},
 {id:"CV",zh:"任脈",s:"任脈",en:"Conception Vessel",es:"Conception Vessel",org:null,yy:["陰脈之海","Sea of Yin"],six:null,limb:null,el:null,pair:"GV",dir:["會陰 → 下唇","Perineum → Lower lip"],n:24,v:"front",alias:"REN",mid:true},
 {id:"GV",zh:"督脈",s:"督脈",en:"Governor Vessel",es:"Governor Vessel",org:null,yy:["陽脈之海","Sea of Yang"],six:null,limb:null,el:null,pair:"CV",dir:["長強 → 上唇","Coccyx → Upper lip"],n:28,v:"back",alias:"DU",mid:true}
];
const MI=Object.fromEntries(M.map(m=>[m.id,m]));
M.forEach(m=>{m.br=BR_MER.indexOf(m.id)});
const GROUPS=[["手三陰","Hand Yin",["LU","PC","HT"]],["手三陽","Hand Yang",["LI","TE","SI"]],["足三陽","Foot Yang",["ST","GB","BL"]],["足三陰","Foot Yin",["SP","LR","KI"]],["任督二脈","Ren & Du",["CV","GV"]]];
const ELS=[["木","Wood","wood"],["火","Fire","fire"],["土","Earth","earth"],["金","Metal","metal"],["水","Water","water"]];

/* ---------- data: points [code, 中文, pinyin, English, view, position, 定位, location] ---------- */
const RAW=[
["LU1","中府","Zhōngfǔ","Middle Palace","front",[190,138],"胸前壁外上方，前正中線旁開6寸，平第1肋間隙","Upper lateral chest, 6 cun from the midline, level with the 1st intercostal space"],
["LU5","尺澤","Chǐzé","Cubit Marsh","front",["A",2,0.45],"肘橫紋上，肱二頭肌腱橈側凹陷","On the elbow crease, in the hollow on the radial side of the biceps tendon"],
["LU7","列缺","Lièquē","Broken Sequence","front",["A",3.74,0.85],"腕橫紋上1.5寸，橈骨莖突上方","1.5 cun above the wrist crease, just above the radial styloid process"],
["LU9","太淵","Tàiyuān","Supreme Abyss","front",["A",4,0.72],"腕掌側橫紋橈側端，橈動脈搏動處","Radial end of the wrist crease, over the radial pulse"],
["LU11","少商","Shàoshāng","Lesser Shang","front",[260,378],"拇指末節橈側，距指甲角0.1寸","Radial side of the thumb, 0.1 cun from the corner of the nail"],
["LI1","商陽","Shāngyáng","Shang Yang","back",["A",7.2,0.6],"食指末節橈側，距指甲角0.1寸","Radial side of the index finger, 0.1 cun from the corner of the nail"],
["LI4","合谷","Hégǔ","Joining Valley","back",[251,356],"手背第1、2掌骨之間，約平第2掌骨中點","Back of the hand between the 1st and 2nd metacarpals, level with the middle of the 2nd"],
["LI11","曲池","Qūchí","Pool at the Crook","back",["A",2,0.9],"屈肘，尺澤與肱骨外上髁連線中點","With the elbow bent, midway between LU5 and the lateral epicondyle"],
["LI15","肩髃","Jiānyú","Shoulder Bone","back",["A",0.15,0.6],"肩峰前下方，舉臂時肩前凹陷處","Below the front of the acromion, in the hollow that forms when the arm is raised"],
["LI20","迎香","Yíngxiāng","Welcome Fragrance","front",[157,64],"鼻翼外緣中點旁，鼻唇溝中","Beside the middle of the nostril, in the nasolabial groove"],
["ST1","承泣","Chéngqì","Container of Tears","front",[162,56],"瞳孔直下，眼球與眶下緣之間","Directly below the pupil, between the eyeball and the lower rim of the eye socket"],
["ST4","地倉","Dìcāng","Earth Granary","front",[161,77],"口角旁開0.4寸","0.4 cun lateral to the corner of the mouth"],
["ST6","頰車","Jiáchē","Jaw Bone","front",[173,76],"下頜角前上方一橫指，咬牙時咬肌隆起處","One finger-width above and in front of the jaw angle, on the masseter when the teeth clench"],
["ST25","天樞","Tiānshū","Heaven's Pivot","front",[166,262],"臍中旁開2寸","2 cun lateral to the navel"],
["ST35","犢鼻","Dúbí","Calf's Nose","front",["L",3.15,0.45],"屈膝，髕韌帶外側凹陷（外膝眼）","With the knee bent, in the hollow lateral to the patellar ligament"],
["ST36","足三里","Zúsānlǐ","Leg Three Miles","front",["L",4.05,0.55],"犢鼻下3寸，脛骨前嵴外一橫指","3 cun below ST35, one finger-width lateral to the crest of the shin bone"],
["ST40","豐隆","Fēnglóng","Abundant Bulge","front",["L",4.9,0.72],"外踝尖上8寸，脛骨前嵴外兩橫指","8 cun above the lateral malleolus, two finger-widths lateral to the shin crest"],
["ST44","內庭","Nèitíng","Inner Courtyard","front",[181,600],"足背第2、3趾間，趾蹼緣後方","Between the 2nd and 3rd toes, just behind the web"],
["SP1","隱白","Yǐnbái","Hidden White","front",[172.5,605],"足大趾末節內側，距趾甲角0.1寸","Medial side of the big toe, 0.1 cun from the corner of the nail"],
["SP3","太白","Tàibái","Supreme White","front",[169,594],"第1蹠趾關節近端內側，赤白肉際","Medial foot, behind the big-toe joint, where the sole skin meets the top"],
["SP6","三陰交","Sānyīnjiāo","Three Yin Intersection","front",["L",5.6,-0.65],"內踝尖上3寸，脛骨內側緣後方","3 cun above the medial malleolus, just behind the inner edge of the tibia"],
["SP9","陰陵泉","Yīnlíngquán","Yin Mound Spring","front",["L",3.5,-0.72],"脛骨內側髁下緣凹陷","In the hollow below the medial condyle of the tibia"],
["SP10","血海","Xuèhǎi","Sea of Blood","front",["L",1.84,-0.55],"屈膝，髕底內側端上2寸，股內側肌隆起處","With the knee bent, 2 cun above the inner top corner of the kneecap, on the bulge of vastus medialis"],
["SP21","大包","Dàbāo","Great Embracement","front",[193,198],"腋中線上，第6肋間隙","On the midaxillary line, in the 6th intercostal space"],
["HT1","極泉","Jíquán","Summit Spring","front",[199,166],"腋窩頂點，腋動脈搏動處","At the apex of the armpit, over the axillary artery"],
["HT3","少海","Shàohǎi","Lesser Sea","front",["A",2,-0.85],"屈肘，肘橫紋內側端與肱骨內上髁連線中點","With the elbow bent, midway between the inner end of the elbow crease and the medial epicondyle"],
["HT7","神門","Shénmén","Spirit Gate","front",["A",4,-0.72],"腕掌側橫紋尺側端，尺側腕屈肌腱橈側凹陷","Ulnar end of the wrist crease, on the radial side of the flexor carpi ulnaris tendon"],
["HT9","少衝","Shàochōng","Lesser Rushing","front",["A",6.5,-0.85],"小指末節橈側，距指甲角0.1寸","Radial side of the little finger, 0.1 cun from the corner of the nail"],
["SI1","少澤","Shàozé","Lesser Marsh","back",["A",6.5,-0.95],"小指末節尺側，距指甲角0.1寸","Ulnar side of the little finger, 0.1 cun from the corner of the nail"],
["SI3","後溪","Hòuxī","Back Stream","back",["A",5.5,-0.98],"握拳，第5掌指關節近端尺側，掌橫紋頭赤白肉際","With a loose fist, on the ulnar edge of the hand just behind the 5th knuckle, at the end of the palm crease"],
["SI6","養老","Yǎnglǎo","Support the Aged","back",["A",3.9,-0.95],"腕背橫紋上1寸，尺骨頭橈側凹陷","1 cun above the back wrist crease, in the hollow on the radial side of the ulnar head"],
["SI8","小海","Xiǎohǎi","Small Sea","back",["A",2,-0.8],"尺骨鷹嘴與肱骨內上髁之間凹陷","In the groove between the olecranon and the medial epicondyle"],
["SI11","天宗","Tiānzōng","Heavenly Gathering","back",[184,164],"肩胛岡下窩中央凹陷","In the hollow at the centre of the infrascapular fossa"],
["SI19","聽宮","Tīnggōng","Palace of Hearing","side",[151,56],"耳屏前，張口時凹陷處","In front of the tragus, in the hollow that forms when the mouth opens"],
["BL1","睛明","Jīngmíng","Bright Eyes","front",[155,47],"目內眥角稍上方凹陷","In the hollow just above the inner corner of the eye"],
["BL2","攢竹","Cuánzhú","Gathered Bamboo","front",[156,38],"眉頭凹陷中，眶上切跡處","At the inner end of the eyebrow, in the supraorbital notch"],
["BL10","天柱","Tiānzhù","Celestial Pillar","back",[161,90],"後髮際正中旁開1.3寸，斜方肌外緣凹陷","1.3 cun lateral to the midline at the hairline, on the outer edge of the trapezius"],
["BL13","肺俞","Fèishū","Lung Shu","back",[161,146],"第3胸椎棘突下，旁開1.5寸","1.5 cun lateral to the lower border of the T3 spinous process"],
["BL15","心俞","Xīnshū","Heart Shu","back",[161,168],"第5胸椎棘突下，旁開1.5寸","1.5 cun lateral to the lower border of the T5 spinous process"],
["BL18","肝俞","Gānshū","Liver Shu","back",[161,206],"第9胸椎棘突下，旁開1.5寸","1.5 cun lateral to the lower border of the T9 spinous process"],
["BL20","脾俞","Píshū","Spleen Shu","back",[161,228],"第11胸椎棘突下，旁開1.5寸","1.5 cun lateral to the lower border of the T11 spinous process"],
["BL23","腎俞","Shènshū","Kidney Shu","back",[161,260],"第2腰椎棘突下，旁開1.5寸","1.5 cun lateral to the lower border of the L2 spinous process"],
["BL40","委中","Wěizhōng","Middle of the Crook","back",["L",3,0],"膕橫紋中點","At the midpoint of the crease behind the knee"],
["BL57","承山","Chéngshān","Support the Mountain","back",["L",4.85,0],"小腿後正中，腓腸肌兩肌腹之間凹陷頂端","Centre of the back of the calf, where the two bellies of the gastrocnemius meet the tendon"],
["BL60","崑崙","Kūnlún","Kunlun Mountains","back",["L",5.95,0.78],"外踝尖與跟腱之間凹陷","In the hollow between the tip of the lateral malleolus and the Achilles tendon"],
["BL67","至陰","Zhìyīn","Reaching Yin","side",[122,607],"小趾末節外側，距趾甲角0.1寸","Lateral side of the little toe, 0.1 cun from the corner of the nail"],
["KI1","湧泉","Yǒngquán","Bubbling Spring","side",[136,609],"足底，捲足時足前部凹陷處，約足底前三分一","On the sole, in the hollow that forms when the toes curl, about a third of the way from the toes"],
["KI3","太溪","Tàixī","Supreme Stream","front",["L",5.95,-0.85],"內踝尖與跟腱之間凹陷","In the hollow between the tip of the medial malleolus and the Achilles tendon"],
["KI6","照海","Zhàohǎi","Shining Sea","front",[167,585],"內踝尖下1寸，內踝下緣凹陷","1 cun below the tip of the medial malleolus, in the hollow beneath it"],
["KI7","復溜","Fùliū","Recover Flow","front",["L",5.73,-0.92],"太溪直上2寸，跟腱前緣","2 cun above KI3, on the front edge of the Achilles tendon"],
["KI10","陰谷","Yīngǔ","Yin Valley","front",["L",3.1,-0.98],"膕橫紋內側端，半腱肌腱與半膜肌腱之間","Inner end of the knee crease, between the semitendinosus and semimembranosus tendons"],
["KI27","俞府","Shūfǔ","Shu Mansion","front",[163,118],"鎖骨下緣，前正中線旁開2寸","Lower border of the clavicle, 2 cun lateral to the midline"],
["PC1","天池","Tiānchí","Heavenly Pool","front",[184,172],"第4肋間隙，乳頭外側1寸","In the 4th intercostal space, 1 cun lateral to the nipple"],
["PC3","曲澤","Qūzé","Marsh at the Crook","front",["A",2,0],"肘橫紋中，肱二頭肌腱尺側緣","On the elbow crease, on the ulnar side of the biceps tendon"],
["PC6","內關","Nèiguān","Inner Pass","front",["A",3.65,0],"腕橫紋上2寸，掌長肌腱與橈側腕屈肌腱之間","2 cun above the wrist crease, between the palmaris longus and flexor carpi radialis tendons"],
["PC7","大陵","Dàlíng","Great Mound","front",["A",4,0],"腕掌側橫紋中點，兩筋之間","Middle of the wrist crease, between the two tendons"],
["PC8","勞宮","Láogōng","Palace of Toil","front",["A",5.2,0.1],"掌心，第2、3掌骨之間偏第3掌骨，握拳時中指尖下","Centre of the palm, between the 2nd and 3rd metacarpals, where the middle fingertip lands in a fist"],
["PC9","中衝","Zhōngchōng","Middle Rushing","front",["A",7.85,0.05],"中指末端最高點","At the very tip of the middle finger"],
["TE1","關衝","Guānchōng","Passage Gate","back",["A",6.9,-0.5],"無名指末節尺側，距指甲角0.1寸","Ulnar side of the ring finger, 0.1 cun from the corner of the nail"],
["TE3","中渚","Zhōngzhǔ","Central Islet","back",["A",5.55,-0.45],"手背第4、5掌骨之間，掌指關節近端凹陷","Back of the hand between the 4th and 5th metacarpals, just behind the knuckles"],
["TE5","外關","Wàiguān","Outer Pass","back",["A",3.65,0],"腕背橫紋上2寸，尺骨與橈骨之間","2 cun above the back wrist crease, between the radius and ulna"],
["TE14","肩髎","Jiānliáo","Shoulder Crevice","back",["A",0.15,0.1],"肩峰角與肱骨大結節之間凹陷，舉臂時肩後凹陷處","Behind and below the acromion, in the hollow that forms when the arm is raised"],
["TE17","翳風","Yìfēng","Wind Screen","side",[164,68],"耳垂後方，乳突與下頜角之間凹陷","Behind the earlobe, in the hollow between the mastoid process and the jaw angle"],
["TE23","絲竹空","Sīzhúkōng","Silk Bamboo Hollow","side",[132,37],"眉梢凹陷處","In the hollow at the outer end of the eyebrow"],
["GB1","瞳子髎","Tóngzǐliáo","Pupil Crevice","side",[132,47],"目外眥外側0.5寸凹陷","0.5 cun lateral to the outer corner of the eye"],
["GB2","聽會","Tīnghuì","Meeting of Hearing","side",[151,63],"耳屏間切跡前，張口時凹陷處","In front of the intertragic notch, in the hollow that forms when the mouth opens"],
["GB14","陽白","Yángbái","Yang White","side",[127,31],"瞳孔直上，眉上1寸","1 cun above the eyebrow, directly above the pupil"],
["GB20","風池","Fēngchí","Wind Pool","side",[165,80],"枕骨之下，胸鎖乳突肌與斜方肌上端之間凹陷","Below the occiput, in the hollow between the sternocleidomastoid and trapezius"],
["GB21","肩井","Jiānjǐng","Shoulder Well","side",[164,122],"大椎與肩峰端連線中點","Midway between GV14 and the tip of the acromion"],
["GB30","環跳","Huántiào","Jumping Circle","side",[176,326],"股骨大轉子最凸點與骶管裂孔連線，外1/3與中1/3交點","Where the outer and middle thirds meet on the line from the greater trochanter to the sacral hiatus"],
["GB34","陽陵泉","Yánglíngquán","Yang Mound Spring","side",["L",4,-0.15],"腓骨頭前下方凹陷","In the hollow in front of and below the head of the fibula"],
["GB39","懸鐘","Xuánzhōng","Suspended Bell","side",["L",5.57,-0.1],"外踝尖上3寸，腓骨前緣","3 cun above the lateral malleolus, on the front edge of the fibula"],
["GB40","丘墟","Qiūxū","Mound of Ruins","side",[158,588],"外踝前下方凹陷","In the hollow in front of and below the lateral malleolus"],
["GB41","足臨泣","Zúlínqì","Foot Governor of Tears","side",[140,598],"第4、5蹠骨底結合部前方凹陷","In the hollow just past where the 4th and 5th metatarsals meet"],
["GB44","足竅陰","Zúqiàoyīn","Yin Portals of the Foot","side",[113,603],"第4趾末節外側，距趾甲角0.1寸","Lateral side of the 4th toe, 0.1 cun from the corner of the nail"],
["LR1","大敦","Dàdūn","Great Pile","front",[176,606],"足大趾末節外側，距趾甲角0.1寸","Lateral side of the big toe, 0.1 cun from the corner of the nail"],
["LR2","行間","Xíngjiān","Moving Between","front",[176.5,598],"足背第1、2趾間，趾蹼緣後方","Between the 1st and 2nd toes, just behind the web"],
["LR3","太衝","Tàichōng","Great Rushing","front",[174,588],"足背第1、2蹠骨間，蹠骨底結合部前方凹陷","On top of the foot, in the hollow before the junction of the 1st and 2nd metatarsals"],
["LR8","曲泉","Qūquán","Spring at the Crook","front",["L",2.95,-0.78],"屈膝，膝內側橫紋頭上方凹陷","With the knee bent, in the hollow above the inner end of the knee crease"],
["LR13","章門","Zhāngmén","Completion Gate","front",[189,238],"第11肋游離端下方","Just below the free end of the 11th rib"],
["LR14","期門","Qīmén","Cycle Gate","front",[176,204],"乳頭直下，第6肋間隙","Directly below the nipple, in the 6th intercostal space"],
["CV4","關元","Guānyuán","Gate of Origin","front",[150,298],"前正中線上，臍下3寸","On the midline, 3 cun below the navel"],
["CV6","氣海","Qìhǎi","Sea of Qi","front",[150,280],"前正中線上，臍下1.5寸","On the midline, 1.5 cun below the navel"],
["CV8","神闕","Shénquè","Spirit Gateway","front",[150,262],"臍中央","At the centre of the navel"],
["CV12","中脘","Zhōngwǎn","Middle Cavity","front",[150,228],"前正中線上，臍上4寸","On the midline, 4 cun above the navel"],
["CV17","膻中","Dànzhōng","Chest Centre","front",[150,172],"前正中線上，平第4肋間隙，兩乳頭連線中點","On the midline at the 4th intercostal space, midway between the nipples"],
["CV22","天突","Tiāntū","Heaven Rushing Out","front",[150,111],"胸骨上窩中央","At the centre of the hollow above the sternum"],
["CV24","承漿","Chéngjiāng","Container of Fluids","front",[150,84],"頦唇溝正中凹陷","In the hollow at the centre of the groove below the lower lip"],
["GV1","長強","Chángqiáng","Long Strong","back",[150,338],"尾骨端下，尾骨端與肛門連線中點","Below the tip of the coccyx, midway between the coccyx and the anus"],
["GV4","命門","Mìngmén","Gate of Life","back",[150,260],"後正中線上，第2腰椎棘突下凹陷","On the midline, in the hollow below the L2 spinous process"],
["GV14","大椎","Dàzhuī","Great Hammer","back",[150,113],"後正中線上，第7頸椎棘突下凹陷","On the midline, in the hollow below the C7 spinous process"],
["GV16","風府","Fēngfǔ","Palace of Wind","back",[150,84],"後髮際正中直上1寸，枕外隆凸直下凹陷","1 cun above the hairline on the midline, just below the external occipital protuberance"],
["GV20","百會","Bǎihuì","Hundred Meetings","side",[150,16],"頭頂正中線上，前髮際正中直上5寸（約兩耳尖連線中點）","Top of the head, 5 cun behind the front hairline, roughly midway between the ear apexes"],
["GV26","水溝","Shuǐgōu","Water Trough","side",[121,68],"人中溝上1/3與中1/3交點（又名人中）","On the philtrum, a third of the way down from the nose (also called Renzhong 人中)"]
];
/* the remaining WHO points; null position = placed along the route between neighbouring points */
const RAW2=[
["LU2","雲門","Yúnmén","Cloud Gate","front",[194,124],"鎖骨下窩凹陷，前正中線旁開6寸","In the hollow below the outer clavicle, 6 cun from the midline"],
["LU3","天府","Tiānfǔ","Palace of Heaven","front",null,"腋前紋頭下3寸，肱二頭肌橈側緣","3 cun below the front armpit fold, on the radial edge of the biceps"],
["LU4","俠白","Xiábái","Guarding White","front",null,"腋前紋頭下4寸，肱二頭肌橈側緣","4 cun below the front armpit fold, on the radial edge of the biceps"],
["LU6","孔最","Kǒngzuì","Maximum Opening","front",null,"尺澤與太淵連線上，腕橫紋上7寸","7 cun above the wrist crease, on the line from LU5 to LU9"],
["LU8","經渠","Jīngqú","Channel Gutter","front",null,"腕橫紋上1寸，橈動脈搏動處","1 cun above the wrist crease, over the radial artery"],
["LU10","魚際","Yújì","Fish Border","front",[251,355],"第1掌骨中點橈側，赤白肉際","At the middle of the 1st metacarpal on the radial side, where the palm skin meets the back"],
["LI2","二間","Èrjiān","Second Interval","back",null,"第2掌指關節遠端橈側凹陷","Radial side of the index finger, in the hollow in front of the 2nd knuckle"],
["LI3","三間","Sānjiān","Third Interval","back",null,"第2掌指關節近端橈側凹陷","Radial side of the hand, in the hollow behind the 2nd knuckle"],
["LI5","陽谿","Yángxī","Yang Stream","back",["A",4,0.85],"腕背橫紋橈側，拇短伸肌腱與拇長伸肌腱之間凹陷（鼻煙窩）","Radial end of the back wrist crease, in the anatomical snuffbox"],
["LI6","偏歷","Piānlì","Veering Passage","back",null,"陽谿與曲池連線上，腕橫紋上3寸","3 cun above LI5, on the line to LI11"],
["LI7","溫溜","Wēnliū","Warm Flow","back",null,"陽谿與曲池連線上，腕橫紋上5寸","5 cun above LI5, on the line to LI11"],
["LI8","下廉","Xiàlián","Lower Ridge","back",null,"曲池下4寸","4 cun below LI11"],
["LI9","上廉","Shànglián","Upper Ridge","back",null,"曲池下3寸","3 cun below LI11"],
["LI10","手三里","Shǒusānlǐ","Arm Three Miles","back",null,"曲池下2寸","2 cun below LI11"],
["LI12","肘髎","Zhǒuliáo","Elbow Crevice","back",["A",1.85,0.95],"屈肘，曲池外上方1寸，肱骨邊緣","1 cun above and lateral to LI11, at the edge of the humerus"],
["LI13","手五里","Shǒuwǔlǐ","Arm Five Miles","back",null,"曲池上3寸，曲池與肩髃連線上","3 cun above LI11, on the line to LI15"],
["LI14","臂臑","Bìnào","Upper Arm","back",null,"曲池上7寸，三角肌止點處","7 cun above LI11, at the lower end of the deltoid"],
["LI16","巨骨","Jùgǔ","Great Bone","back",[207,121],"鎖骨肩峰端與肩胛岡之間凹陷","In the hollow between the outer end of the clavicle and the spine of the scapula"],
["LI17","天鼎","Tiāndǐng","Heaven's Tripod","front",[176,109],"扶突直下1寸，胸鎖乳突肌後緣","1 cun below LI18, at the back edge of the sternocleidomastoid"],
["LI18","扶突","Fútū","Support the Prominence","front",null,"平喉結，胸鎖乳突肌前後緣之間","Level with the Adam's apple, between the two heads of the sternocleidomastoid"],
["LI19","口禾髎","Kǒuhéliáo","Grain Crevice","front",null,"鼻孔外緣直下，平水溝","Directly below the outer edge of the nostril, level with GV26"],
["ST2","四白","Sìbái","Four Whites","front",null,"瞳孔直下，眶下孔凹陷處","Directly below the pupil, in the hollow of the infraorbital foramen"],
["ST3","巨髎","Jùliáo","Great Crevice","front",null,"瞳孔直下，平鼻翼下緣","Directly below the pupil, level with the lower edge of the nostril"],
["ST5","大迎","Dàyíng","Great Welcome","front",[165,86],"下頜角前方，咬肌附着部前緣，面動脈搏動處","In front of the jaw angle at the front edge of the masseter, over the facial artery"],
["ST7","下關","Xiàguān","Below the Joint","front",null,"顴弓下緣中央與下頜切跡之間凹陷","In the hollow below the zygomatic arch, in front of the jaw joint"],
["ST8","頭維","Tóuwéi","Head Binding","front",[171,26],"額角髮際直上0.5寸，頭正中線旁開4.5寸","0.5 cun into the hairline at the corner of the forehead, 4.5 cun from the midline"],
["ST9","人迎","Rényíng","Man's Welcome","front",[163,98],"喉結旁開1.5寸，頸總動脈搏動處","1.5 cun lateral to the Adam's apple, over the carotid pulse"],
["ST10","水突","Shuǐtū","Water Prominence","front",null,"人迎與氣舍連線中點，胸鎖乳突肌前緣","Midway between ST9 and ST11, at the front edge of the sternocleidomastoid"],
["ST11","氣舍","Qìshè","Abode of Qi","front",null,"鎖骨內側端上緣，胸鎖乳突肌胸骨頭與鎖骨頭之間","At the top of the inner clavicle, between the two heads of the sternocleidomastoid"],
["ST12","缺盆","Quēpén","Empty Basin","front",[176,118],"鎖骨上窩中央，前正中線旁開4寸","In the centre of the hollow above the clavicle, 4 cun from the midline"],
["ST13","氣戶","Qìhù","Qi Door","front",null,"鎖骨下緣，前正中線旁開4寸","Below the clavicle, 4 cun from the midline"],
["ST14","庫房","Kùfáng","Storehouse","front",null,"第1肋間隙，前正中線旁開4寸","1st intercostal space, 4 cun from the midline"],
["ST15","屋翳","Wūyì","Roof","front",null,"第2肋間隙，前正中線旁開4寸","2nd intercostal space, 4 cun from the midline"],
["ST16","膺窗","Yīngchuāng","Breast Window","front",null,"第3肋間隙，前正中線旁開4寸","3rd intercostal space, 4 cun from the midline"],
["ST17","乳中","Rǔzhōng","Breast Centre","front",[176,170],"乳頭中央（只作定位標誌，不針不灸）","At the centre of the nipple (a landmark only, not needled)"],
["ST18","乳根","Rǔgēn","Root of the Breast","front",null,"乳頭直下，第5肋間隙","Directly below the nipple, in the 5th intercostal space"],
["ST19","不容","Bùróng","Not Contained","front",[170,214],"臍上6寸，前正中線旁開2寸","6 cun above the navel, 2 cun from the midline"],
["ST20","承滿","Chéngmǎn","Supporting Fullness","front",null,"臍上5寸，前正中線旁開2寸","5 cun above the navel, 2 cun from the midline"],
["ST21","梁門","Liángmén","Beam Gate","front",null,"臍上4寸，前正中線旁開2寸","4 cun above the navel, 2 cun from the midline"],
["ST22","關門","Guānmén","Pass Gate","front",null,"臍上3寸，前正中線旁開2寸","3 cun above the navel, 2 cun from the midline"],
["ST23","太乙","Tàiyǐ","Supreme Unity","front",null,"臍上2寸，前正中線旁開2寸","2 cun above the navel, 2 cun from the midline"],
["ST24","滑肉門","Huáròumén","Slippery Flesh Gate","front",null,"臍上1寸，前正中線旁開2寸","1 cun above the navel, 2 cun from the midline"],
["ST26","外陵","Wàilíng","Outer Mound","front",null,"臍下1寸，前正中線旁開2寸","1 cun below the navel, 2 cun from the midline"],
["ST27","大巨","Dàjù","The Great","front",null,"臍下2寸，前正中線旁開2寸","2 cun below the navel, 2 cun from the midline"],
["ST28","水道","Shuǐdào","Water Passage","front",null,"臍下3寸，前正中線旁開2寸","3 cun below the navel, 2 cun from the midline"],
["ST29","歸來","Guīlái","Return","front",null,"臍下4寸，前正中線旁開2寸","4 cun below the navel, 2 cun from the midline"],
["ST30","氣衝","Qìchōng","Surging Qi","front",[164,316],"臍下5寸，前正中線旁開2寸，腹股溝稍上方","5 cun below the navel, 2 cun from the midline, just above the groin"],
["ST31","髀關","Bìguān","Thigh Gate","front",null,"髂前上棘與髕底外側端連線上，平臀溝","On the line from the front iliac spine to the outer top of the kneecap, level with the gluteal fold"],
["ST32","伏兔","Fútù","Crouching Rabbit","front",null,"髕底上6寸，髂前上棘與髕底外側端連線上","6 cun above the kneecap, on the line from the front iliac spine"],
["ST33","陰市","Yīnshì","Yin Market","front",null,"髕底外側端上3寸","3 cun above the outer top corner of the kneecap"],
["ST34","梁丘","Liángqiū","Ridge Mound","front",["L",2.2,0.5],"髕底外側端上2寸，股外側肌與股直肌腱之間","2 cun above the outer top corner of the kneecap, between vastus lateralis and the rectus femoris tendon"],
["ST37","上巨虛","Shàngjùxū","Upper Great Void","front",["L",4.6,0.55],"犢鼻下6寸，脛骨前嵴外一橫指","6 cun below ST35, one finger-width lateral to the shin crest"],
["ST38","條口","Tiáokǒu","Lines Opening","front",["L",4.9,0.55],"犢鼻下8寸，脛骨前嵴外一橫指","8 cun below ST35, one finger-width lateral to the shin crest"],
["ST39","下巨虛","Xiàjùxū","Lower Great Void","front",["L",5.05,0.55],"犢鼻下9寸，脛骨前嵴外一橫指","9 cun below ST35, one finger-width lateral to the shin crest"],
["ST41","解谿","Jiěxī","Stream Divide","front",["L",5.95,0.1],"踝關節前面中央凹陷，兩肌腱之間","Front of the ankle, in the hollow between the two tendons"],
["ST42","衝陽","Chōngyáng","Surging Yang","front",null,"足背最高點，足背動脈搏動處","At the highest point of the instep, over the dorsalis pedis pulse"],
["ST43","陷谷","Xiàngǔ","Sunken Valley","front",null,"第2、3蹠骨結合部前方凹陷","In the hollow in front of the junction of the 2nd and 3rd metatarsals"],
["ST45","厲兌","Lìduì","Severe Mouth","front",[181,607],"第2趾末節外側，距趾甲角0.1寸","Lateral side of the 2nd toe, 0.1 cun from the corner of the nail"],
["SP2","大都","Dàdū","Great Metropolis","front",null,"足大趾內側，第1蹠趾關節遠端赤白肉際","Medial side of the big toe, in front of the 1st toe joint, at the edge of the sole skin"],
["SP4","公孫","Gōngsūn","Grandfather Grandson","front",null,"第1蹠骨底前下方，赤白肉際","Below and in front of the base of the 1st metatarsal, at the edge of the sole skin"],
["SP5","商丘","Shāngqiū","Shang Hill","front",[167,580],"內踝前下方凹陷","In the hollow in front of and below the medial malleolus"],
["SP7","漏谷","Lòugǔ","Leaking Valley","front",null,"內踝尖上6寸，脛骨內側緣後方","6 cun above the medial malleolus, behind the inner edge of the tibia"],
["SP8","地機","Dìjī","Earth Pivot","front",null,"陰陵泉下3寸，脛骨內側緣後方","3 cun below SP9, behind the inner edge of the tibia"],
["SP11","箕門","Jīmén","Winnowing Gate","front",null,"血海上6寸，血海與衝門連線上","6 cun above SP10, on the line to SP12"],
["SP12","衝門","Chōngmén","Rushing Gate","front",[173,318],"腹股溝外側，前正中線旁開3.5寸，股動脈外側","In the groin, 3.5 cun from the midline, lateral to the femoral artery"],
["SP13","府舍","Fǔshè","Abode of the Fu","front",null,"衝門外上方0.7寸，前正中線旁開4寸","0.7 cun above SP12, 4 cun from the midline"],
["SP14","腹結","Fùjié","Abdomen Knot","front",null,"大橫下1.3寸，前正中線旁開4寸","1.3 cun below SP15, 4 cun from the midline"],
["SP15","大橫","Dàhéng","Great Horizontal","front",[178,262],"臍中旁開4寸","4 cun lateral to the navel"],
["SP16","腹哀","Fù'āi","Abdomen Sorrow","front",null,"臍上3寸，前正中線旁開4寸","3 cun above the navel, 4 cun from the midline"],
["SP17","食竇","Shídòu","Food Cavity","front",[188,190],"第5肋間隙，前正中線旁開6寸","5th intercostal space, 6 cun from the midline"],
["SP18","天谿","Tiānxī","Heavenly Stream","front",null,"第4肋間隙，前正中線旁開6寸","4th intercostal space, 6 cun from the midline"],
["SP19","胸鄉","Xiōngxiāng","Chest Village","front",null,"第3肋間隙，前正中線旁開6寸","3rd intercostal space, 6 cun from the midline"],
["SP20","周榮","Zhōuróng","Encircling Glory","front",[191,144],"第2肋間隙，前正中線旁開6寸","2nd intercostal space, 6 cun from the midline"],
["HT2","青靈","Qīnglíng","Green Spirit","front",null,"少海上3寸，肱二頭肌內側溝","3 cun above HT3, in the groove medial to the biceps"],
["HT4","靈道","Língdào","Spirit Path","front",["A",3.74,-0.72],"腕橫紋上1.5寸，尺側腕屈肌腱橈側","1.5 cun above the wrist crease, radial to the flexor carpi ulnaris tendon"],
["HT5","通里","Tōnglǐ","Penetrating the Interior","front",["A",3.83,-0.72],"腕橫紋上1寸，尺側腕屈肌腱橈側","1 cun above the wrist crease, radial to the flexor carpi ulnaris tendon"],
["HT6","陰郄","Yīnxì","Yin Cleft","front",["A",3.91,-0.72],"腕橫紋上0.5寸，尺側腕屈肌腱橈側","0.5 cun above the wrist crease, radial to the flexor carpi ulnaris tendon"],
["HT8","少府","Shàofǔ","Lesser Palace","front",["A",5.3,-0.55],"掌心，第4、5掌骨之間，握拳時小指尖處","In the palm between the 4th and 5th metacarpals, where the little fingertip lands in a fist"],
["SI2","前谷","Qiángǔ","Front Valley","back",null,"第5掌指關節遠端尺側，赤白肉際","Ulnar side of the little finger, in front of the 5th knuckle"],
["SI4","腕骨","Wàngǔ","Wrist Bone","back",null,"第5掌骨底與鈎骨之間凹陷，赤白肉際","Ulnar edge of the hand, in the hollow between the base of the 5th metacarpal and the hamate"],
["SI5","陽谷","Yánggǔ","Yang Valley","back",null,"腕背橫紋尺側端，尺骨莖突與三角骨之間凹陷","Ulnar end of the back wrist crease, between the ulnar styloid and the triquetral bone"],
["SI7","支正","Zhīzhèng","Branch to the Correct","back",null,"腕背橫紋上5寸，尺骨尺側","5 cun above the back wrist crease, on the ulnar side of the ulna"],
["SI9","肩貞","Jiānzhēn","True Shoulder","back",[197,159],"腋後紋頭上1寸","1 cun above the back armpit fold"],
["SI10","臑俞","Nàoshū","Upper Arm Shu","back",null,"腋後紋頭直上，肩胛岡下緣凹陷","Directly above the back armpit fold, in the hollow below the spine of the scapula"],
["SI12","秉風","Bǐngfēng","Grasping the Wind","back",[186,138],"肩胛岡上窩中央","In the centre of the hollow above the spine of the scapula"],
["SI13","曲垣","Qūyuán","Crooked Wall","back",[172,133],"肩胛岡內側端上緣凹陷","In the hollow above the inner end of the spine of the scapula"],
["SI14","肩外俞","Jiānwàishū","Outer Shoulder Shu","back",[172,123],"第1胸椎棘突下，旁開3寸","3 cun lateral to the lower border of the T1 spinous process"],
["SI15","肩中俞","Jiānzhōngshū","Middle Shoulder Shu","back",[164,114],"第7頸椎棘突下，旁開2寸","2 cun lateral to the lower border of the C7 spinous process"],
["SI16","天窗","Tiānchuāng","Heavenly Window","side",[160,98],"平喉結，胸鎖乳突肌後緣","Level with the Adam's apple, at the back edge of the sternocleidomastoid"],
["SI17","天容","Tiānróng","Heavenly Appearance","side",[152,85],"下頜角後方，胸鎖乳突肌前緣凹陷","Behind the jaw angle, in the hollow at the front edge of the sternocleidomastoid"],
["SI18","顴髎","Quánliáo","Cheek Bone Crevice","side",[134,62],"目外眥直下，顴骨下緣凹陷","Directly below the outer corner of the eye, in the hollow below the cheekbone"],
["BL3","眉衝","Méichōng","Eyebrows Ascension","side",[124,31],"攢竹直上，入前髮際0.5寸","Directly above BL2, 0.5 cun into the front hairline"],
["BL4","曲差","Qūchā","Deviating Curve","side",[128,26],"前髮際正中直上0.5寸，旁開1.5寸","0.5 cun into the front hairline, 1.5 cun from the midline"],
["BL5","五處","Wǔchù","Fifth Place","side",[133,22],"前髮際正中直上1寸，旁開1.5寸","1 cun into the front hairline, 1.5 cun from the midline"],
["BL6","承光","Chéngguāng","Receiving Light","side",[142,19],"前髮際正中直上2.5寸，旁開1.5寸","2.5 cun into the front hairline, 1.5 cun from the midline"],
["BL7","通天","Tōngtiān","Heavenly Connection","side",[154,16],"前髮際正中直上4寸，旁開1.5寸","4 cun into the front hairline, 1.5 cun from the midline"],
["BL8","絡卻","Luòquè","Declining Connection","side",[166,19],"前髮際正中直上5.5寸，旁開1.5寸","5.5 cun into the front hairline, 1.5 cun from the midline"],
["BL9","玉枕","Yùzhěn","Jade Pillow","back",[161,70],"後髮際正中直上2.5寸，旁開1.3寸，平枕外隆凸上緣","2.5 cun above the back hairline, 1.3 cun from the midline, level with the top of the occipital protuberance"],
["BL11","大杼","Dàzhù","Great Shuttle","back",[161,124],"第1胸椎棘突下，旁開1.5寸","1.5 cun lateral to the lower border of the T1 spinous process"],
["BL12","風門","Fēngmén","Wind Gate","back",[161,135],"第2胸椎棘突下，旁開1.5寸","1.5 cun lateral to the lower border of the T2 spinous process"],
["BL14","厥陰俞","Juéyīnshū","Jueyin Shu","back",[161,157],"第4胸椎棘突下，旁開1.5寸","1.5 cun lateral to the lower border of the T4 spinous process"],
["BL16","督俞","Dūshū","Governor Shu","back",[161,178],"第6胸椎棘突下，旁開1.5寸","1.5 cun lateral to the lower border of the T6 spinous process"],
["BL17","膈俞","Géshū","Diaphragm Shu","back",[161,188],"第7胸椎棘突下，旁開1.5寸","1.5 cun lateral to the lower border of the T7 spinous process"],
["BL19","膽俞","Dǎnshū","Gallbladder Shu","back",[161,217],"第10胸椎棘突下，旁開1.5寸","1.5 cun lateral to the lower border of the T10 spinous process"],
["BL21","胃俞","Wèishū","Stomach Shu","back",[161,239],"第12胸椎棘突下，旁開1.5寸","1.5 cun lateral to the lower border of the T12 spinous process"],
["BL22","三焦俞","Sānjiāoshū","Sanjiao Shu","back",[161,250],"第1腰椎棘突下，旁開1.5寸","1.5 cun lateral to the lower border of the L1 spinous process"],
["BL24","氣海俞","Qìhǎishū","Sea of Qi Shu","back",[161,270],"第3腰椎棘突下，旁開1.5寸","1.5 cun lateral to the lower border of the L3 spinous process"],
["BL25","大腸俞","Dàchángshū","Large Intestine Shu","back",[161,280],"第4腰椎棘突下，旁開1.5寸","1.5 cun lateral to the lower border of the L4 spinous process"],
["BL26","關元俞","Guānyuánshū","Gate of Origin Shu","back",[160,290],"第5腰椎棘突下，旁開1.5寸","1.5 cun lateral to the lower border of the L5 spinous process"],
["BL27","小腸俞","Xiǎochángshū","Small Intestine Shu","back",[160,300],"平第1骶後孔，骶正中嵴旁開1.5寸","Level with the 1st sacral foramen, 1.5 cun from the midline"],
["BL28","膀胱俞","Pángguāngshū","Bladder Shu","back",[159,309],"平第2骶後孔，骶正中嵴旁開1.5寸","Level with the 2nd sacral foramen, 1.5 cun from the midline"],
["BL29","中膂俞","Zhōnglǚshū","Mid-Spine Shu","back",[159,318],"平第3骶後孔，骶正中嵴旁開1.5寸","Level with the 3rd sacral foramen, 1.5 cun from the midline"],
["BL30","白環俞","Báihuánshū","White Ring Shu","back",[160,327],"平第4骶後孔，骶正中嵴旁開1.5寸","Level with the 4th sacral foramen, 1.5 cun from the midline"],
["BL31","上髎","Shàngliáo","Upper Crevice","back",[155,301],"第1骶後孔中","In the 1st posterior sacral foramen"],
["BL32","次髎","Cìliáo","Second Crevice","back",[155,310],"第2骶後孔中","In the 2nd posterior sacral foramen"],
["BL33","中髎","Zhōngliáo","Middle Crevice","back",[155,319],"第3骶後孔中","In the 3rd posterior sacral foramen"],
["BL34","下髎","Xiàliáo","Lower Crevice","back",[155,328],"第4骶後孔中","In the 4th posterior sacral foramen"],
["BL35","會陽","Huìyáng","Meeting of Yang","back",[154,340],"尾骨端旁開0.5寸","0.5 cun lateral to the tip of the coccyx"],
["BL36","承扶","Chéngfú","Support","back",["L",0.6,-0.1],"臀橫紋中點","At the midpoint of the gluteal fold"],
["BL37","殷門","Yīnmén","Gate of Abundance","back",["L",1.5,0],"承扶下6寸，承扶與委中連線上","6 cun below BL36, on the line to BL40"],
["BL38","浮郄","Fúxì","Floating Cleft","back",["L",2.6,0.35],"委陽上1寸，股二頭肌腱內側","1 cun above BL39, medial to the biceps femoris tendon"],
["BL39","委陽","Wěiyáng","Outside of the Crook","back",["L",3,0.42],"膕橫紋外側端，股二頭肌腱內側","Outer end of the knee crease, medial to the biceps femoris tendon"],
["BL41","附分","Fùfēn","Attached Branch","back",[172,135],"第2胸椎棘突下，旁開3寸","3 cun lateral to the lower border of the T2 spinous process"],
["BL42","魄戶","Pòhù","Door of the Corporeal Soul","back",[172,146],"第3胸椎棘突下，旁開3寸","3 cun lateral to the lower border of the T3 spinous process"],
["BL43","膏肓","Gāohuāng","Vital Region","back",[172,157],"第4胸椎棘突下，旁開3寸","3 cun lateral to the lower border of the T4 spinous process"],
["BL44","神堂","Shéntáng","Spirit Hall","back",[172,168],"第5胸椎棘突下，旁開3寸","3 cun lateral to the lower border of the T5 spinous process"],
["BL45","譩譆","Yìxǐ","Yi Xi","back",[172,178],"第6胸椎棘突下，旁開3寸","3 cun lateral to the lower border of the T6 spinous process"],
["BL46","膈關","Géguān","Diaphragm Pass","back",[172,188],"第7胸椎棘突下，旁開3寸","3 cun lateral to the lower border of the T7 spinous process"],
["BL47","魂門","Húnmén","Gate of the Ethereal Soul","back",[172,206],"第9胸椎棘突下，旁開3寸","3 cun lateral to the lower border of the T9 spinous process"],
["BL48","陽綱","Yánggāng","Yang's Key Link","back",[172,217],"第10胸椎棘突下，旁開3寸","3 cun lateral to the lower border of the T10 spinous process"],
["BL49","意舍","Yìshè","Abode of Thought","back",[172,228],"第11胸椎棘突下，旁開3寸","3 cun lateral to the lower border of the T11 spinous process"],
["BL50","胃倉","Wèicāng","Stomach Granary","back",[172,239],"第12胸椎棘突下，旁開3寸","3 cun lateral to the lower border of the T12 spinous process"],
["BL51","肓門","Huāngmén","Vitals Gate","back",[172,250],"第1腰椎棘突下，旁開3寸","3 cun lateral to the lower border of the L1 spinous process"],
["BL52","志室","Zhìshì","Room of the Will","back",[172,260],"第2腰椎棘突下，旁開3寸","3 cun lateral to the lower border of the L2 spinous process"],
["BL53","胞肓","Bāohuāng","Bladder's Vitals","back",[170,310],"平第2骶後孔，骶正中嵴旁開3寸","Level with the 2nd sacral foramen, 3 cun from the midline"],
["BL54","秩邊","Zhìbiān","Order's Limit","back",[169,328],"平第4骶後孔，骶正中嵴旁開3寸","Level with the 4th sacral foramen, 3 cun from the midline"],
["BL55","合陽","Héyáng","Confluence of Yang","back",["L",3.4,0],"委中下2寸","2 cun below BL40"],
["BL56","承筋","Chéngjīn","Support the Sinews","back",["L",4.3,0],"委中下5寸，腓腸肌兩肌腹之間","5 cun below BL40, between the two bellies of the gastrocnemius"],
["BL58","飛揚","Fēiyáng","Soaring Upwards","back",["L",5.05,0.45],"崑崙直上7寸，承山外下方1寸","7 cun above BL60, about 1 cun below and lateral to BL57"],
["BL59","跗陽","Fūyáng","Instep Yang","back",["L",5.55,0.7],"崑崙直上3寸","3 cun directly above BL60"],
["BL61","僕參","Púcān","Servant's Respect","side",[173,600],"崑崙直下，跟骨外側赤白肉際","Directly below BL60, on the side of the heel bone at the edge of the sole skin"],
["BL62","申脈","Shēnmài","Extending Vessel","side",[167,591],"外踝尖直下，外踝下緣凹陷","In the hollow directly below the tip of the lateral malleolus"],
["BL63","金門","Jīnmén","Golden Gate","side",[158,598],"外踝前緣直下，骰骨下緣凹陷","Below the front edge of the lateral malleolus, at the lower edge of the cuboid"],
["BL64","京骨","Jīnggǔ","Capital Bone","side",[146,604],"第5蹠骨粗隆前下方，赤白肉際","Below the tuberosity of the 5th metatarsal, at the edge of the sole skin"],
["BL65","束骨","Shùgǔ","Bundle Bone","side",[135,606],"第5蹠趾關節近端，赤白肉際","Behind the 5th toe joint, at the edge of the sole skin"],
["BL66","足通谷","Zútōnggǔ","Foot Connecting Valley","side",[128,607],"第5蹠趾關節遠端，赤白肉際","In front of the 5th toe joint, at the edge of the sole skin"],
["KI2","然谷","Rángǔ","Blazing Valley","front",[171,597],"足舟骨粗隆下方，赤白肉際","Below the navicular tuberosity, at the edge of the sole skin"],
["KI4","大鍾","Dàzhōng","Great Bell","front",null,"太溪下0.5寸稍後，跟腱附着部內側","Slightly below and behind KI3, on the inner side of the Achilles attachment"],
["KI5","水泉","Shuǐquán","Water Spring","front",null,"太溪直下1寸，跟骨結節內側凹陷","1 cun directly below KI3, in the hollow on the inner side of the heel bone"],
["KI8","交信","Jiāoxìn","Exchange Belief","front",null,"復溜前0.5寸，脛骨內側緣後方","0.5 cun in front of KI7, behind the inner edge of the tibia"],
["KI9","築賓","Zhùbīn","Guest House","front",null,"太溪上5寸，太溪與陰谷連線上","5 cun above KI3, on the line to KI10"],
["KI11","橫骨","Hénggǔ","Pubic Bone","front",[155,318],"臍下5寸，前正中線旁開0.5寸","5 cun below the navel, 0.5 cun from the midline"],
["KI12","大赫","Dàhè","Great Glory","front",null,"臍下4寸，前正中線旁開0.5寸","4 cun below the navel, 0.5 cun from the midline"],
["KI13","氣穴","Qìxué","Qi Hole","front",null,"臍下3寸，前正中線旁開0.5寸","3 cun below the navel, 0.5 cun from the midline"],
["KI14","四滿","Sìmǎn","Fourfold Fullness","front",null,"臍下2寸，前正中線旁開0.5寸","2 cun below the navel, 0.5 cun from the midline"],
["KI15","中注","Zhōngzhù","Middle Flow","front",null,"臍下1寸，前正中線旁開0.5寸","1 cun below the navel, 0.5 cun from the midline"],
["KI16","肓俞","Huāngshū","Vitals Shu","front",[155,262],"臍中旁開0.5寸","0.5 cun lateral to the navel"],
["KI17","商曲","Shāngqū","Shang Bend","front",null,"臍上2寸，前正中線旁開0.5寸","2 cun above the navel, 0.5 cun from the midline"],
["KI18","石關","Shíguān","Stone Pass","front",null,"臍上3寸，前正中線旁開0.5寸","3 cun above the navel, 0.5 cun from the midline"],
["KI19","陰都","Yīndū","Yin Metropolis","front",null,"臍上4寸，前正中線旁開0.5寸","4 cun above the navel, 0.5 cun from the midline"],
["KI20","腹通谷","Fùtōnggǔ","Abdomen Connecting Valley","front",null,"臍上5寸，前正中線旁開0.5寸","5 cun above the navel, 0.5 cun from the midline"],
["KI21","幽門","Yōumén","Dark Gate","front",[156,212],"臍上6寸，前正中線旁開0.5寸","6 cun above the navel, 0.5 cun from the midline"],
["KI22","步廊","Bùláng","Walking Corridor","front",null,"第5肋間隙，前正中線旁開2寸","5th intercostal space, 2 cun from the midline"],
["KI23","神封","Shénfēng","Spirit Seal","front",null,"第4肋間隙，前正中線旁開2寸","4th intercostal space, 2 cun from the midline"],
["KI24","靈墟","Língxū","Spirit Ruins","front",null,"第3肋間隙，前正中線旁開2寸","3rd intercostal space, 2 cun from the midline"],
["KI25","神藏","Shéncáng","Spirit Storehouse","front",null,"第2肋間隙，前正中線旁開2寸","2nd intercostal space, 2 cun from the midline"],
["KI26","彧中","Yùzhōng","Comfortable Chest","front",null,"第1肋間隙，前正中線旁開2寸","1st intercostal space, 2 cun from the midline"],
["PC2","天泉","Tiānquán","Heavenly Spring","front",null,"腋前紋頭下2寸，肱二頭肌兩頭之間","2 cun below the front armpit fold, between the two heads of the biceps"],
["PC4","郄門","Xìmén","Cleft Gate","front",["A",3.13,0],"腕橫紋上5寸，兩筋之間","5 cun above the wrist crease, between the two tendons"],
["PC5","間使","Jiānshǐ","Intermediary Courier","front",["A",3.48,0],"腕橫紋上3寸，兩筋之間","3 cun above the wrist crease, between the two tendons"],
["TE2","液門","Yèmén","Fluid Gate","back",null,"第4、5指間，指蹼緣後方赤白肉際","Between the 4th and 5th fingers, just behind the web"],
["TE4","陽池","Yángchí","Yang Pool","back",["A",4,-0.05],"腕背橫紋中，指伸肌腱尺側凹陷","On the back wrist crease, in the hollow ulnar to the extensor digitorum tendons"],
["TE6","支溝","Zhīgōu","Branch Ditch","back",["A",3.48,0],"腕背橫紋上3寸，尺骨與橈骨之間","3 cun above the back wrist crease, between the radius and ulna"],
["TE7","會宗","Huìzōng","Assembly of the Clan","back",["A",3.48,-0.38],"腕背橫紋上3寸，尺骨橈側緣","3 cun above the back wrist crease, on the radial edge of the ulna"],
["TE8","三陽絡","Sānyángluò","Three Yang Luo","back",["A",3.3,0],"腕背橫紋上4寸，尺骨與橈骨之間","4 cun above the back wrist crease, between the radius and ulna"],
["TE9","四瀆","Sìdú","Four Rivers","back",["A",2.8,0],"肘尖下5寸，尺骨與橈骨之間","5 cun below the tip of the elbow, between the radius and ulna"],
["TE10","天井","Tiānjǐng","Heavenly Well","back",["A",1.77,-0.05],"屈肘，肘尖上1寸凹陷","With the elbow bent, in the hollow 1 cun above the tip of the elbow"],
["TE11","清冷淵","Qīnglěngyuān","Clear Cold Abyss","back",["A",1.54,0],"屈肘，肘尖上2寸","With the elbow bent, 2 cun above the tip of the elbow"],
["TE12","消濼","Xiāoluò","Dispersing Luo River","back",["A",1.1,0],"肘尖上5寸，清冷淵與臑會連線中點","5 cun above the tip of the elbow, midway between TE11 and TE13"],
["TE13","臑會","Nàohuì","Upper Arm Meeting","back",["A",0.6,0.05],"肩峰角下3寸，三角肌後下緣","3 cun below the acromion angle, at the lower back edge of the deltoid"],
["TE15","天髎","Tiānliáo","Heavenly Crevice","back",[184,126],"肩胛骨上角凹陷","In the hollow above the superior angle of the scapula"],
["TE16","天牖","Tiānyǒu","Window of Heaven","side",[166,90],"平下頜角，胸鎖乳突肌後緣凹陷","Level with the jaw angle, at the back edge of the sternocleidomastoid"],
["TE18","瘈脈","Chìmài","Spasm Vessel","side",[168,60],"耳後乳突中央，角孫與翳風沿耳輪連線下1/3處","Behind the ear at the centre of the mastoid, a third of the way up the curve from TE17 to TE20"],
["TE19","顱息","Lúxī","Skull's Rest","side",[167,50],"耳後，角孫與翳風沿耳輪連線上1/3處","Behind the ear, two thirds of the way up the curve from TE17 to TE20"],
["TE20","角孫","Jiǎosūn","Minute Angle","side",[160,41],"耳尖直上入髮際處","Directly above the ear apex, at the hairline"],
["TE21","耳門","Ěrmén","Ear Gate","side",[151,50],"耳屏上切跡前，張口時凹陷處","In front of the upper notch of the tragus, in the hollow that forms when the mouth opens"],
["TE22","耳和髎","Ěrhéliáo","Harmony Crevice","side",[146,45],"鬢髮後緣，耳廓根前方，顳淺動脈後緣","In front of the ear root, at the back edge of the sideburn"],
["GB3","上關","Shàngguān","Above the Joint","side",[147,52],"下關直上，顴弓上緣凹陷","Directly above ST7, in the hollow above the zygomatic arch"],
["GB4","頷厭","Hànyàn","Jaw Serenity","side",[140,31],"頭維與曲鬢弧形連線上1/4與下3/4交點","On the curve from ST8 to GB7, a quarter of the way down"],
["GB5","懸顱","Xuánlú","Suspended Skull","side",[141,36],"頭維與曲鬢弧形連線中點","Midway along the curve from ST8 to GB7"],
["GB6","懸釐","Xuánlí","Suspended Hair","side",[143,41],"頭維與曲鬢弧形連線上3/4與下1/4交點","On the curve from ST8 to GB7, three quarters of the way down"],
["GB7","曲鬢","Qūbìn","Crook of the Temple","side",[148,44],"耳前鬢角髮際後緣與耳尖水平線交點","Where the back edge of the sideburn meets the level of the ear apex"],
["GB8","率谷","Shuàigǔ","Leading Valley","side",[157,32],"耳尖直上，入髮際1.5寸","Directly above the ear apex, 1.5 cun into the hairline"],
["GB9","天衝","Tiānchōng","Heavenly Rushing","side",[164,35],"耳根後緣直上入髮際2寸，率谷後0.5寸","2 cun into the hairline above the back of the ear root, 0.5 cun behind GB8"],
["GB10","浮白","Fúbái","Floating White","side",[168,44],"天衝與完骨弧形連線上1/3與下2/3交點","On the curve from GB9 to GB12, a third of the way down"],
["GB11","頭竅陰","Tóuqiàoyīn","Yin Portals of the Head","side",[168,56],"天衝與完骨弧形連線上2/3與下1/3交點","On the curve from GB9 to GB12, two thirds of the way down"],
["GB12","完骨","Wángǔ","Mastoid Process","side",[167,69],"耳後乳突後下方凹陷","In the hollow behind and below the mastoid process"],
["GB13","本神","Běnshén","Root of the Spirit","side",[133,25],"前髮際上0.5寸，頭正中線旁開3寸","0.5 cun into the front hairline, 3 cun from the midline"],
["GB15","頭臨泣","Tóulínqì","Head Governor of Tears","side",[129,23],"瞳孔直上，入前髮際0.5寸","Directly above the pupil, 0.5 cun into the front hairline"],
["GB16","目窗","Mùchuāng","Window of the Eye","side",[136,19],"瞳孔直上，入前髮際1.5寸","Directly above the pupil, 1.5 cun into the front hairline"],
["GB17","正營","Zhèngyíng","Upright Nourishment","side",[146,18],"瞳孔直上，入前髮際2.5寸","Directly above the pupil, 2.5 cun into the front hairline"],
["GB18","承靈","Chénglíng","Spirit Support","side",[160,20],"瞳孔直上，入前髮際4寸","Directly above the pupil, 4 cun into the front hairline"],
["GB19","腦空","Nǎokōng","Brain Hollow","side",[175,62],"風池直上，平枕外隆凸上緣","Directly above GB20, level with the top of the occipital protuberance"],
["GB22","淵腋","Yuānyè","Armpit Abyss","side",[156,168],"腋中線上，第4肋間隙","On the midaxillary line, in the 4th intercostal space"],
["GB23","輒筋","Zhéjīn","Sinew Seat","side",[150,174],"淵腋前1寸，第4肋間隙","1 cun in front of GB22, in the 4th intercostal space"],
["GB24","日月","Rìyuè","Sun and Moon","side",[140,212],"乳頭直下，第7肋間隙","Directly below the nipple, in the 7th intercostal space"],
["GB25","京門","Jīngmén","Capital Gate","side",[162,244],"第12肋游離端下方","Below the free end of the 12th rib"],
["GB26","帶脈","Dàimài","Girdling Vessel","side",[158,262],"第11肋游離端直下，平臍","Directly below the free end of the 11th rib, level with the navel"],
["GB27","五樞","Wǔshū","Five Pivots","side",[142,288],"髂前上棘內側，平臍下3寸","Just medial to the front iliac spine, level with 3 cun below the navel"],
["GB28","維道","Wéidào","Linking Path","side",[144,297],"五樞前下0.5寸","0.5 cun in front of and below GB27"],
["GB29","居髎","Jūliáo","Squatting Crevice","side",[162,310],"髂前上棘與股骨大轉子最凸點連線中點","Midway between the front iliac spine and the greater trochanter"],
["GB31","風市","Fēngshì","Wind Market","side",["L",1.33,0],"大腿外側正中，膕橫紋上7寸（直立垂手時中指尖處）","Middle of the outer thigh, 7 cun above the knee crease, where the middle fingertip rests when standing"],
["GB32","中瀆","Zhōngdú","Middle Ditch","side",["L",1.64,0],"大腿外側正中，膕橫紋上5寸","Middle of the outer thigh, 5 cun above the knee crease"],
["GB33","膝陽關","Xīyángguān","Knee Yang Gate","side",["L",2.6,0.05],"股骨外上髁後上緣，股二頭肌腱與髂脛束之間凹陷","In the hollow above the lateral epicondyle of the femur, between the biceps femoris tendon and the iliotibial band"],
["GB35","陽交","Yángjiāo","Yang Intersection","side",["L",5,0.25],"外踝尖上7寸，腓骨後緣","7 cun above the lateral malleolus, on the back edge of the fibula"],
["GB36","外丘","Wàiqiū","Outer Hill","side",["L",5,-0.15],"外踝尖上7寸，腓骨前緣","7 cun above the lateral malleolus, on the front edge of the fibula"],
["GB37","光明","Guāngmíng","Bright Light","side",["L",5.29,-0.12],"外踝尖上5寸，腓骨前緣","5 cun above the lateral malleolus, on the front edge of the fibula"],
["GB38","陽輔","Yángfǔ","Yang Assistance","side",["L",5.43,-0.11],"外踝尖上4寸，腓骨前緣","4 cun above the lateral malleolus, on the front edge of the fibula"],
["GB42","地五會","Dìwǔhuì","Earth Five Meetings","side",[133,600],"第4、5蹠骨間，第4蹠趾關節近端凹陷","Between the 4th and 5th metatarsals, just behind the 4th toe joint"],
["GB43","俠谿","Xiáxī","Clamped Stream","side",[122,602],"第4、5趾間，趾蹼緣後方赤白肉際","Between the 4th and 5th toes, just behind the web"],
["LR4","中封","Zhōngfēng","Middle Seal","front",[171,576],"內踝前，脛骨前肌腱內側凹陷","In front of the medial malleolus, in the hollow medial to the tibialis anterior tendon"],
["LR5","蠡溝","Lígōu","Woodworm Canal","front",["L",5.35,-0.3],"內踝尖上5寸，脛骨內側面中央","5 cun above the medial malleolus, at the centre of the inner surface of the tibia"],
["LR6","中都","Zhōngdū","Middle Capital","front",["L",5.05,-0.32],"內踝尖上7寸，脛骨內側面中央","7 cun above the medial malleolus, at the centre of the inner surface of the tibia"],
["LR7","膝關","Xīguān","Knee Joint","front",["L",3.55,-0.9],"陰陵泉後1寸，脛骨內側髁下方","1 cun behind SP9, below the medial condyle of the tibia"],
["LR9","陰包","Yīnbāo","Yin Wrapping","front",["L",1.7,-0.75],"髕底上4寸，股內肌與縫匠肌之間","4 cun above the kneecap, between vastus medialis and sartorius"],
["LR10","足五里","Zúwǔlǐ","Leg Five Miles","front",["L",0.4,-0.6],"氣衝直下3寸，大腿根部","3 cun directly below ST30, at the top of the inner thigh"],
["LR11","陰廉","Yīnlián","Yin Corner","front",["L",0.25,-0.58],"氣衝直下2寸，大腿根部","2 cun directly below ST30, at the top of the inner thigh"],
["LR12","急脈","Jímài","Urgent Pulse","front",[168,320],"恥骨結節外側，前正中線旁開2.5寸","Beside the pubic tubercle, 2.5 cun from the midline"],
["CV1","會陰","Huìyīn","Meeting of Yin","front",[150,348],"會陰部正中","At the centre of the perineum"],
["CV2","曲骨","Qūgǔ","Curved Bone","front",[150,316],"恥骨聯合上緣中點，臍下5寸","At the top of the pubic symphysis, 5 cun below the navel"],
["CV3","中極","Zhōngjí","Middle Pole","front",[150,308],"前正中線上，臍下4寸","On the midline, 4 cun below the navel"],
["CV5","石門","Shímén","Stone Gate","front",[150,289],"前正中線上，臍下2寸","On the midline, 2 cun below the navel"],
["CV7","陰交","Yīnjiāo","Yin Intersection","front",[150,271],"前正中線上，臍下1寸","On the midline, 1 cun below the navel"],
["CV9","水分","Shuǐfēn","Water Separation","front",[150,254],"前正中線上，臍上1寸","On the midline, 1 cun above the navel"],
["CV10","下脘","Xiàwǎn","Lower Cavity","front",[150,245],"前正中線上，臍上2寸","On the midline, 2 cun above the navel"],
["CV11","建里","Jiànlǐ","Strengthen the Interior","front",[150,237],"前正中線上，臍上3寸","On the midline, 3 cun above the navel"],
["CV13","上脘","Shàngwǎn","Upper Cavity","front",[150,220],"前正中線上，臍上5寸","On the midline, 5 cun above the navel"],
["CV14","巨闕","Jùquè","Great Gateway","front",[150,212],"前正中線上，臍上6寸","On the midline, 6 cun above the navel"],
["CV15","鳩尾","Jiūwěi","Turtledove Tail","front",[150,203],"前正中線上，臍上7寸，劍胸結合下1寸","On the midline, 7 cun above the navel, 1 cun below the xiphisternal junction"],
["CV16","中庭","Zhōngtíng","Central Courtyard","front",[150,194],"前正中線上，劍胸結合中點，平第5肋間隙","On the midline at the xiphisternal junction, level with the 5th intercostal space"],
["CV18","玉堂","Yùtáng","Jade Hall","front",[150,158],"前正中線上，平第3肋間隙","On the midline, level with the 3rd intercostal space"],
["CV19","紫宮","Zǐgōng","Purple Palace","front",[150,145],"前正中線上，平第2肋間隙","On the midline, level with the 2nd intercostal space"],
["CV20","華蓋","Huágài","Florid Canopy","front",[150,132],"前正中線上，平第1肋間隙","On the midline, level with the 1st intercostal space"],
["CV21","璇璣","Xuánjī","Jade Pivot","front",[150,121],"前正中線上，胸骨上窩下1寸","On the midline, 1 cun below the hollow above the sternum"],
["CV23","廉泉","Liánquán","Corner Spring","front",[150,97],"前正中線上，喉結上方，舌骨上緣凹陷","On the midline above the Adam's apple, in the hollow above the hyoid bone"],
["GV2","腰俞","Yāoshū","Lumbar Shu","back",[150,326],"後正中線上，正對骶管裂孔","On the midline, at the sacral hiatus"],
["GV3","腰陽關","Yāoyángguān","Lumbar Yang Gate","back",[150,280],"後正中線上，第4腰椎棘突下凹陷","On the midline, in the hollow below the L4 spinous process"],
["GV5","懸樞","Xuánshū","Suspended Pivot","back",[150,250],"後正中線上，第1腰椎棘突下凹陷","On the midline, in the hollow below the L1 spinous process"],
["GV6","脊中","Jǐzhōng","Centre of the Spine","back",[150,228],"後正中線上，第11胸椎棘突下凹陷","On the midline, in the hollow below the T11 spinous process"],
["GV7","中樞","Zhōngshū","Central Pivot","back",[150,217],"後正中線上，第10胸椎棘突下凹陷","On the midline, in the hollow below the T10 spinous process"],
["GV8","筋縮","Jīnsuō","Sinew Contraction","back",[150,206],"後正中線上，第9胸椎棘突下凹陷","On the midline, in the hollow below the T9 spinous process"],
["GV9","至陽","Zhìyáng","Reaching Yang","back",[150,188],"後正中線上，第7胸椎棘突下凹陷","On the midline, in the hollow below the T7 spinous process"],
["GV10","靈台","Língtái","Spirit Tower","back",[150,178],"後正中線上，第6胸椎棘突下凹陷","On the midline, in the hollow below the T6 spinous process"],
["GV11","神道","Shéndào","Spirit Path","back",[150,168],"後正中線上，第5胸椎棘突下凹陷","On the midline, in the hollow below the T5 spinous process"],
["GV12","身柱","Shēnzhù","Body Pillar","back",[150,146],"後正中線上，第3胸椎棘突下凹陷","On the midline, in the hollow below the T3 spinous process"],
["GV13","陶道","Táodào","Kiln Path","back",[150,124],"後正中線上，第1胸椎棘突下凹陷","On the midline, in the hollow below the T1 spinous process"],
["GV15","啞門","Yǎmén","Gate of Muteness","back",[150,92],"後髮際正中直上0.5寸","On the midline, 0.5 cun above the back hairline"],
["GV17","腦戶","Nǎohù","Brain's Door","back",[150,70],"枕外隆凸上緣凹陷","In the hollow above the external occipital protuberance"],
["GV18","強間","Qiángjiān","Unyielding Space","back",[150,54],"後髮際正中直上4寸","On the midline, 4 cun above the back hairline"],
["GV19","後頂","Hòudǐng","Behind the Crown","back",[150,36],"後髮際正中直上5.5寸","On the midline, 5.5 cun above the back hairline"],
["GV21","前頂","Qiándǐng","In Front of the Crown","side",[139,19],"前髮際正中直上3.5寸，百會前1.5寸","On the midline, 3.5 cun into the front hairline, 1.5 cun in front of GV20"],
["GV22","顖會","Xìnhuì","Fontanel Meeting","side",[130,24],"前髮際正中直上2寸","On the midline, 2 cun into the front hairline"],
["GV23","上星","Shàngxīng","Upper Star","side",[125,30],"前髮際正中直上1寸","On the midline, 1 cun into the front hairline"],
["GV24","神庭","Shéntíng","Spirit Courtyard","side",[122,35],"前髮際正中直上0.5寸","On the midline, 0.5 cun into the front hairline"],
["GV25","素髎","Sùliáo","White Crevice","side",[111,58],"鼻尖正中","At the tip of the nose"],
["GV27","兌端","Duìduān","Extremity of the Mouth","side",[121,72],"上唇結節中點","At the centre of the upper lip tubercle"],
["GV28","齦交","Yínjiāo","Gum Intersection","side",[124,71],"上唇內，上唇繫帶與上牙齦相接處","Inside the upper lip, where the frenulum meets the gum"]
];
const CORE=new Set(RAW.map(a=>a[0]));
const P=RAW.concat(RAW2).map(a=>({c:a[0],zh:a[1],py:a[2],tr:a[3],v:a[4],at:a[5],lz:a[6],le:a[7],m:a[0].replace(/\d+/,""),n:+a[0].replace(/\D+/,"")}));
const PI=Object.fromEntries(P.map(p=>[p.c,p]));
M.forEach(m=>{m.pts=P.filter(p=>p.m===m.id).sort((a,b)=>a.n-b.n)});

/* ---------- geometry ---------- */
const LIMBS={
 front:{A:[[204,132,15],[214,190,12],[222,242,10.5],[232,292,9],[242,338,7.5],[247,360,11],[250,385,10],[252,400,6],[253,407,1.5]],
        L:[[178,318,26],[176,380,22],[174,430,17],[174,448,16],[174,470,15],[174,515,14],[176,574,8.5]]},
 side:{A:[[156,132,13],[134,170,11.5],[112,206,10],[96,238,8.5],[80,268,7],[70,284,9],[63,296,8],[59,304,5],[56,310,1.5]],
        L:[[166,322,24],[162,385,20],[158,430,16],[158,448,15],[159,472,14.5],[161,520,13.5],[166,576,8]]}
};
LIMBS.back=LIMBS.front;
const lerp=(a,b,t)=>a+(b-a)*t, f1=v=>Math.round(v*10)/10;
function limbAt(nodes,u,k){let i=Math.floor(u);if(i>nodes.length-2)i=nodes.length-2;if(i<0)i=0;const f=u-i,a=nodes[i],b=nodes[i+1];
 const x=lerp(a[0],b[0],f),y=lerp(a[1],b[1],f),w=lerp(a[2],b[2],f);let dx=b[0]-a[0],dy=b[1]-a[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;return [x+dy*w*k,y-dx*w*k];}
function resolve(view,p){return typeof p[0]==="number"?p:limbAt(LIMBS[view][p[0]],p[1],p[2]);}
function cr(P,closed){const n=P.length;if(n<2)return"";const g=i=>closed?P[(i+n)%n]:P[Math.max(0,Math.min(n-1,i))];
 let d=`M${f1(P[0][0])},${f1(P[0][1])}`;const segs=closed?n:n-1;
 for(let i=0;i<segs;i++){const p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2);
  d+=`C${f1(p1[0]+(p2[0]-p0[0])/6)},${f1(p1[1]+(p2[1]-p0[1])/6)} ${f1(p2[0]-(p3[0]-p1[0])/6)},${f1(p2[1]-(p3[1]-p1[1])/6)} ${f1(p2[0])},${f1(p2[1])}`;}
 return d+(closed?"Z":"");}
function tube(nodes){const L=[],R=[];for(let i=0;i<nodes.length;i++){const a=nodes[Math.max(0,i-1)],b=nodes[Math.min(nodes.length-1,i+1)];
 let dx=b[0]-a[0],dy=b[1]-a[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;const [x,y,w]=nodes[i];L.push([x+dy*w,y-dx*w]);R.push([x-dy*w,y+dx*w]);}
 return cr(L.concat(R.reverse()),true);}
const mirN=ns=>ns.map(([x,y,w])=>[W-x,y,w]), mirP=ps=>ps.map(([x,y])=>[W-x,y]);

/* ---------- body silhouettes ---------- */
const HEAD_F=[[150,14],[170,18],[181,34],[182,54],[178,70],[170,84],[158,92],[150,94],[142,92],[130,84],[122,70],[118,54],[119,34],[130,18]];
const TORSO_F=[[150,106],[166,108],[188,116],[206,124],[214,140],[204,172],[196,205],[190,255],[200,295],[202,325],[182,346],[150,352],[118,346],[98,325],[100,295],[110,255],[104,205],[96,172],[86,140],[94,124],[112,116],[134,108]];
const THUMB=[[246,346,4.5],[253,360,4],[257,372,3],[259,380,1.2]];
const FOOT_F=[[176,572,9],[178,590,11.5],[180,604,10],[181,610,4]];
const FOOT_B=[[176,572,9],[178,590,10],[178,600,8],[178,605,3]];
const HEAD_S=[[150,13],[170,17],[182,32],[184,52],[178,70],[168,84],[160,92],[146,95],[132,91],[124,86],[120,78],[119,68],[116,63],[109,58],[117,44],[120,32],[130,19]];
const TORSO_S=[[142,112],[128,124],[120,140],[116,165],[118,195],[124,225],[126,250],[122,280],[124,305],[134,330],[150,345],[166,350],[184,342],[192,322],[190,300],[180,270],[176,245],[180,215],[186,180],[186,150],[180,128],[172,116],[158,110]];
const FOOT_S=[[156,568],[172,570],[178,592],[176,607],[160,611],[110,610],[103,604],[116,596],[140,590],[152,582]];
const pth=d=>`<path d="${d}"/>`, ell=(x,y,rx,ry)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`;
const layer=sh=>`<g class="sil-o">${sh}</g><g class="sil-f">${sh}</g>`;
function bodyFB(back){const A=LIMBS.front.A,L=LIMBS.front.L,FT=back?FOOT_B:FOOT_F;
 return layer(pth(cr(HEAD_F,true))+ell(183,56,4.5,9)+ell(117,56,4.5,9)+pth("M134,80 L166,80 L170,116 L130,116 Z")+pth(cr(TORSO_F,true))
  +ell(206,138,14,13)+ell(94,138,14,13)+pth(tube(A))+pth(tube(mirN(A)))+pth(tube(THUMB))+pth(tube(mirN(THUMB)))
  +pth(tube(L))+pth(tube(mirN(L)))+pth(tube(FT))+pth(tube(mirN(FT))));}
const DET_FRONT=`<g class="det">
<path d="M157,48 q5,-3.5 10,0 M133,48 q5,-3.5 10,0 M155,39 q6,-3 13,0 M132,39 q7,-3 13,0 M150,50 L147,63 q3,2.5 6,0 M144,77 q6,3 12,0"/>
<path d="M154,113 Q176,114 198,122 M146,113 Q124,114 102,122 M156,186 Q176,196 194,180 M144,186 Q124,196 106,180"/>
<circle class="dot" cx="176" cy="170" r="1.4"/><circle class="dot" cx="124" cy="170" r="1.4"/>
<ellipse cx="150" cy="262" rx="2" ry="2.8"/>
<path d="M188,304 Q174,322 158,338 M112,304 Q126,322 142,338"/>
<ellipse cx="174" cy="442" rx="6.5" ry="8"/><ellipse cx="126" cy="442" rx="6.5" ry="8"/>
<path d="M215,243 q7,2 14,0 M85,243 q-7,2 -14,0 M236,338 q6,1.5 12,0 M64,338 q-6,1.5 -12,0"/>
</g>`;
const DET_BACK=`<g class="det">
<path d="M124,74 Q150,82 176,74"/>
<path class="dash" d="M150,110 L150,326"/>
<path d="M168,134 L171,196 Q175,205 182,199 L198,152 M166,141 L204,129 M132,134 L129,196 Q125,205 118,199 L102,152 M134,141 L96,129"/>
<path d="M150,322 L150,350 M154,354 Q172,362 194,350 M146,354 Q128,362 106,350"/>
<path d="M164,447 q10,3 20,0 M136,447 q-10,3 -20,0 M218,236 q4,-3 8,0 M82,236 q-4,-3 -8,0"/>
<path d="M176,540 L177,572 M124,540 L123,572"/>
</g>`;
function bodySide(){const A=LIMBS.side.A,L=LIMBS.side.L;
 return layer(pth(cr(HEAD_S,true))+pth(tube([[156,76,13],[154,96,13],[156,118,15]]))+pth(cr(TORSO_S,true))+pth(tube(L))+pth(cr(FOOT_S,true)))
  +layer(ell(158,136,13,12)+pth(tube(A))+pth(tube([[72,282,3.6],[67,275,3],[63,270,2],[61,267,0.8]])));}
const DET_SIDE=`<g class="det">
<path d="M122,46 q4,-2.5 8,0 M120,38 q6,-3 13,0 M120,77 l6,0"/>
<ellipse cx="159" cy="54" rx="6.5" ry="10.5"/><path d="M156,48 q4,-3 6,2 q1,6 -3,9"/>
<path d="M176,128 Q188,152 179,190 M146,436 q-4,12 0,22"/>
<circle cx="167" cy="580" r="3"/>
</g>`;
const BODY={front:bodyFB(false)+DET_FRONT,back:bodyFB(true)+DET_BACK,side:bodySide()+DET_SIDE};

/* ---------- meridian routes (each polyline runs in the direction qi flows) ---------- */
const PATHS={
 LU:{front:[[[190,138],[192,126],[200,128],["A",0.4,0.55],["A",1,0.6],["A",2,0.45],["A",3,0.65],["A",3.74,0.85],["A",4,0.72],[251,355],[256,367],[260,378]]]},
 LI:{back:[[["A",7.2,0.6],["A",6.2,0.75],[251,356],["A",4.2,0.85],["A",4,0.85],["A",3,0.85],["A",2,0.9],["A",1,0.75],["A",0.15,0.6],[208,122]]],
     front:[[[206,124],[188,118],[168,104],[163,91],[161,80],[158,71],[157,64]]],
     side:[[["A",7.2,-0.6],["A",6,-0.8],["A",4,-0.85],["A",2,-0.85],["A",1,-0.75],["A",0.2,-0.6],[148,122],[146,108],[142,98],[133,88],[126,78],[122,70],[120,63]]]},
 ST:{front:[[[162,56],[160,66],[161,77],[165,86],[173,76],[177,62],[176,42],[171,26]],
            [[165,86],[163,98],[166,110],[176,118],[176,150],[176,190],[170,220],[166,240],[166,262],[166,290],[164,318],["L",0.25,0.35],["L",1,0.45],["L",2,0.5],["L",3.15,0.45],["L",4.05,0.55],["L",4.9,0.72],["L",5.95,0.1],[179,590],[181,600],[181,607]]],
     side:[[[126,54],[124,64],[125,77],[134,88],[148,81],[146,62],[141,42],[134,22]],
           [[134,88],[138,100],[136,112],[124,132],[121,160],[122,190],[126,222],[128,262],[127,295],[136,320],["L",0.35,-0.75],["L",1,-0.72],["L",2,-0.72],["L",3.15,-0.72],["L",4.05,-0.62],["L",4.9,-0.6],["L",5.95,-0.9],[150,590],[128,600],[108,606]]]},
 SP:{front:[[[172.5,605],[169,594],[167,582],["L",5.6,-0.65],["L",4.6,-0.62],["L",3.5,-0.72],["L",2.6,-0.62],["L",1.84,-0.55],["L",1,-0.45],["L",0.15,-0.3],[173,316],[178,298],[178,262],[182,232],[187,200],[190,165],[191,144],[195,168],[193,198]]]},
 HT:{front:[[[199,166],["A",0.75,-0.75],["A",1.5,-0.8],["A",2,-0.85],["A",3,-0.75],["A",4,-0.72],["A",5.4,-0.8],["A",6.5,-0.85]]]},
 SI:{back:[[["A",6.5,-0.95],["A",5.5,-0.98],["A",4.3,-0.95],["A",3.9,-0.95],["A",3,-0.85],["A",2,-0.8],["A",1,-0.85],["A",0.55,-0.85],[190,152],[184,164],[186,138],[172,132],[162,120],[166,106],[167,92],[174,78]]],
     side:[[["A",6.5,0.9],["A",5.5,0.95],["A",4.3,0.9],["A",2,0.9],["A",0.8,0.95],[170,154],[178,150],[176,132],[166,120],[160,98],[152,84],[140,70],[133,62],[143,57],[151,56]]]},
 BL:{front:[[[155,47],[156,38],[158,26],[160,15]]],
     back:[[[161,16],[161,40],[161,70],[161,90],[161,118],[161,146],[161,168],[161,206],[161,228],[161,260],[160,290],[158,318],[166,340],["L",0.6,-0.1],["L",1.5,0],["L",3,0]],
           [[172,128],[172,170],[172,230],[172,262],[170,300],["L",0.4,0.3],["L",1.5,0.35],["L",2.6,0.15],["L",3,0]],
           [["L",3,0],["L",4.85,0],["L",5.6,0.4],["L",5.95,0.78],[190,586]]],
     side:[[[124,30],[136,16],[156,12],[172,20],[178,40],[176,62],[168,80],[165,96],[172,116],[180,140],[181,170],[178,210],[172,245],[176,270],[184,300],[186,322],["L",0.5,0.8],["L",1.5,0.85],["L",3,0.9],["L",4.85,0.85],["L",5.95,0.75],[168,592],[150,603],[136,606],[122,607]]]},
 KI:{front:[[[171,597],[167,585],["L",5.95,-0.85],["L",5.73,-0.92],["L",4.6,-0.9],["L",3.1,-0.98],["L",2,-0.93],["L",1,-0.9],["L",0.2,-0.92],[155,322],[155,300],[155,262],[156,232],[164,200],[164,160],[163,118]]],
     side:[[[134,609],[146,607],[156,600]]]},
 PC:{front:[[[184,172],[192,170],["A",0.62,0.02],["A",1,0],["A",2,0],["A",3,0],["A",3.65,0],["A",4,0],["A",5.2,0.1],["A",6.4,0.05],["A",7.85,0.05]]]},
 TE:{back:[[["A",6.9,-0.5],["A",6,-0.45],["A",5.55,-0.45],["A",4.6,-0.25],["A",4,-0.05],["A",3.65,0],["A",3,0],["A",2,-0.1],["A",1,0],["A",0.15,0.1],[192,124],[176,112],[167,98],[170,80],[178,64]]],
     side:[[["A",7,0],["A",5.55,0.05],["A",4,0],["A",3.65,0],["A",2,0.05],["A",1,0.25],["A",0.25,0.35],[166,122],[167,100],[164,68],[168,58],[164,44],[157,42],[151,50],[141,42],[132,37]]]},
 GB:{side:[[[132,47],[142,56],[151,63],[147,48],[145,38],[155,32],[165,37],[168,48],[167,60],[167,69],[158,52],[146,34],[133,26],[127,31],[131,21],[148,16],[166,22],[176,40],[176,60],[165,80],[163,96],[163,110],[164,122],[160,148],[156,168],[148,190],[140,212],[152,236],[162,246],[158,262],[142,288],[144,297],[162,310],[176,326],["L",0.6,0.15],["L",1.1,0],["L",2,0],["L",3,-0.05],["L",4,-0.15],["L",5,-0.1],["L",5.57,-0.1],[158,588],[150,594],[140,598],[126,601],[113,603]]],
     back:[[[175,58],[170,72],[162,86],[170,102],[188,120]]]},
 LR:{front:[[[176,606],[176.5,598],[174,588],[171,576],["L",5.6,-0.3],["L",4.6,-0.5],["L",2.95,-0.78],["L",2,-0.7],["L",1,-0.7],["L",0.1,-0.55],[168,320],[174,300],[186,262],[189,238],[184,222],[176,204]]]},
 CV:{front:[[[150,348],[150,318],[150,298],[150,280],[150,262],[150,228],[150,172],[150,111],[150,96],[150,84]]],
     side:[[[166,346],[150,343],[136,330],[127,306],[125,280],[128,252],[127,226],[121,196],[119,166],[123,142],[131,126],[142,113],[143,104],[137,93],[127,87],[123,81]]]},
 GV:{back:[[[150,338],[150,300],[150,260],[150,180],[150,113],[150,84],[150,50],[150,16]]],
     side:[[[182,338],[187,318],[187,300],[178,272],[172,246],[178,212],[183,178],[183,148],[176,126],[168,114],[165,98],[167,82],[176,62],[179,44],[172,26],[162,18],[150,16],[138,19],[127,28],[121,40],[117,46],[112,57],[117,63],[121,68],[122,72],[124,71]]]}
};

/* ---------- zoom presets ---------- */
const ZFB={full:[0,0,300,620],head:[88,0,124,122],trunk:[78,96,144,272],arm:[176,112,100,306],leg:[116,298,114,322]};
const ZOOMS={front:ZFB,back:ZFB,side:{full:[0,0,300,620],head:[90,4,112,112],trunk:[92,100,116,262],arm:[34,108,144,226],leg:[88,298,114,322]}};
function regionOf(p){if(typeof p.at[0]==="string")return p.at[0]==="A"?"arm":"leg";const [x,y]=p.at;
 if(y<100)return"head";if(p.v!=="side"&&x>=205&&y>=150)return"arm";if(p.v==="side"&&x<112&&y>150&&y<330)return"arm";if(y>=330)return"leg";return"trunk";}
/* place points that have no fixed position evenly along the drawn route between their neighbours */
function sampleRoute(P){const n=P.length,g=i=>P[Math.max(0,Math.min(n-1,i))],out=[];let s=0,prev=null;
 for(let i=0;i<n-1;i++){const p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2);
  const c1=[p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6],c2=[p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6];
  for(let j=i?1:0;j<=20;j++){const t=j/20,u=1-t;
   const x=u*u*u*p1[0]+3*u*u*t*c1[0]+3*u*t*t*c2[0]+t*t*t*p2[0],y=u*u*u*p1[1]+3*u*u*t*c1[1]+3*u*t*t*c2[1]+t*t*t*p2[1];
   if(prev)s+=Math.hypot(x-prev[0],y-prev[1]);out.push([x,y,s]);prev=[x,y];}}
 return out;}
const nearest=(S,p)=>{let bi=0,bd=1e9;S.forEach((q,i)=>{const d=Math.hypot(q[0]-p[0],q[1]-p[1]);if(d<bd){bd=d;bi=i}});return [bi,bd];};
(function placeInterp(){
 M.forEach(m=>{const list=m.pts;
  for(let i=0;i<list.length;i++){const p=list[i];if(p.at)continue;
   let j=i;while(j<list.length&&!list[j].at&&list[j].v===p.v)j++;
   const run=list.slice(i,j),v=p.v;
   const A=list.slice(0,i).reverse().find(q=>q.at&&q.v===v),B=list.slice(j).find(q=>q.at&&q.v===v);
   const routes=((PATHS[m.id]||{})[v]||[]).map(seg=>sampleRoute(seg.map(q=>resolve(v,q))));
   if(!A||!B||!routes.length){run.forEach(q=>{q.at=[150,300];console.warn("no anchor for",q.c)});i=j-1;continue;}
   const pa=resolve(v,A.at),pb=resolve(v,B.at);let best=null;
   routes.forEach(S=>{const [ia,da]=nearest(S,pa),[ib,db]=nearest(S,pb);if(!best||da+db<best.d)best={S,ia,ib,d:da+db};});
   const sa=best.S[best.ia][2],sb=best.S[best.ib][2];
   run.forEach((q,k)=>{const s=sa+(sb-sa)*(k+1)/(run.length+1);let bi=0,bd=1e9;
    best.S.forEach((pt,ii)=>{const d=Math.abs(pt[2]-s);if(d<bd){bd=d;bi=ii}});q.at=[f1(best.S[bi][0]),f1(best.S[bi][1])];});
   i=j-1;}});
})();

const SIL={HEAD_F,TORSO_F,HEAD_S,TORSO_S};
const USES=window.MA_USES||{};
P.forEach(p=>{const u=USES[p.c];p.uz=u?u[0]:"";p.ue=u?u[1]:"";});
let B3=null;
/* ---------- state ---------- */
const nowBr=()=>{const h=new Date().getHours();return Math.floor(((h+1)%24)/2)};
const S={tab:"model",lang:store.get("jl_lang","both"),set:store.get("jl_set","core"),view:"front",sel:null,pt:null,zoom:"full",vb:[0,0,300,620]};
if(!["core","all"].includes(S.set))S.set="core";
const inSet=p=>S.set==="all"||CORE.has(p.c);
const ptsOf=m=>m.pts.filter(inSet);
const setPts=()=>P.filter(inSet);
S.sel=BR_MER[nowBr()];S.view=MI[S.sel].v;
if(window.MA_FORCE_LANG)S.lang=window.MA_FORCE_LANG;
if(!["zh","en","both"].includes(S.lang))S.lang="both";

/* ---------- language helpers ---------- */
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const bi=(zh,en)=>S.lang==="zh"?esc(zh):S.lang==="en"?esc(en):`${esc(zh)}<span class="en">${esc(en)}</span>`;
const plain=(zh,en)=>S.lang==="zh"?zh:S.lang==="en"?en:`${zh} ${en}`;
const pad=n=>String(n).padStart(2,"0");
const brHours=i=>{const s=(i*2+23)%24;return `${pad(s)}:00–${pad((s+2)%24)}:00`};
const ptName=p=>S.lang==="zh"?p.zh:S.lang==="en"?p.py:`${p.zh} ${p.py}`;
const merName=m=>S.lang==="en"?m.en:m.zh;
const merShort=m=>S.lang==="en"?m.es:m.s;
function applyStatic(){$$("[data-zh]").forEach(el=>{el.innerHTML=el.classList.contains("one")?esc(S.lang==="en"?el.dataset.en:el.dataset.zh):bi(el.dataset.zh,el.dataset.en)});
 const q=$("#q");if(q)q.placeholder=S.lang==="en"?"Search: Zusanli, ST36, Hegu, headache…":S.lang==="zh"?"搜尋：足三里、ST36、合谷、頭痛…":"搜尋 Search：足三里、ST36、Hegu、頭痛、insomnia…";
 if(B3)B3.relabel();
 $$("#langSeg button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.lang===S.lang));
 $$("#setSeg button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.set===S.set));
 document.documentElement.lang=S.lang==="en"?"en":"zh-Hant-HK";}

/* ---------- figure ---------- */
function figSVG(view,o){
 const vb=o.vb,k=Math.max(vb[2]/300,vb[3]/620);let out=BODY[view];
 const bil=id=>view!=="side"&&!MI[id].mid;
 const rest=[],top=[];
 const ids=o.only?[o.only]:M.map(m=>m.id);
 for(const id of ids){const segs=(PATHS[id]||{})[view];if(!segs)continue;
  const on=o.sel===id,col=`var(--m-${id})`;const ds=[];
  segs.forEach(seg=>{const pts=seg.map(p=>resolve(view,p));ds.push(cr(pts));if(bil(id))ds.push(cr(mirP(pts)));});
  let g=`<g class="mer${on?" on":""}" data-mer="${id}">`;
  ds.forEach(d=>{if(on&&!o.quiz)g+=`<path class="halo" d="${d}"/>`;g+=`<path class="ln" d="${d}" style="stroke:${col}"/>`;
   if(on&&!o.quiz)g+=`<path class="flow" d="${d}"/>`;if(!o.quiz)g+=`<path class="hit" d="${d}"/>`;});
  (on?top:rest).push(g+"</g>");}
 out+=`<g class="mers${o.sel?" has-sel":""}">${rest.join("")}${top.join("")}</g>`;
 // points
 let dots="",hits="",labels="";const placed=[];
 const vis=P.filter(p=>p.v===view&&(o.quiz?p.c===o.pt:inSet(p)));
 const order=vis.slice().sort((a,b)=>(a.m===o.sel)-(b.m===o.sel)||(a.c===o.pt)-(b.c===o.pt));
 for(const p of order){const on=p.m===o.sel,cur=p.c===o.pt;const pos=resolve(view,p.at);
  const list=bil(p.m)?[pos,[W-pos[0],pos[1]]]:[pos];
  const dense=S.set==="all";const r=(cur?4.4:on?(dense?2.6:3.3):o.sel?(dense?1.4:1.9):(dense?1.8:2.6))*k;
  list.forEach(([x,y])=>{
   if(cur)dots+=`<circle class="ring" cx="${f1(x)}" cy="${f1(y)}" r="${f1(r*1.2)}" style="stroke:var(--m-${p.m})"/>`;
   dots+=`<circle class="pt${!on&&o.sel&&!cur?" dim":""}" cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" style="fill:var(--m-${p.m})"/>`;
   if(!o.quiz)hits+=`<circle class="pthit" data-pt="${p.c}" cx="${f1(x)}" cy="${f1(y)}" r="${f1(8.5*k)}"><title>${esc(p.c+" "+p.zh+" "+p.py)}</title></circle>`;});
 }
 if(!o.quiz){
  const cand=[];if(o.pt&&PI[o.pt]&&PI[o.pt].v===view)cand.push(PI[o.pt]);
  if(o.sel)ptsOf(MI[o.sel]).forEach(p=>{if(p.v===view&&p.c!==o.pt)cand.push(p)});
  for(const p of cand){const cur=p.c===o.pt;const [x,y]=resolve(view,p.at);
   if(x<vb[0]||x>vb[0]+vb[2]||y<vb[1]||y>vb[1]+vb[3])continue;
   const fs=(cur?11:8.6)*k;const tooClose=placed.some(([a,b])=>Math.abs(a-x)<22*k&&Math.abs(b-y)<fs*1.05);
   if(tooClose&&!cur)continue;placed.push([x,y]);
   const right=x<vb[0]+vb[2]*0.68;const tx=x+(right?1:-1)*(cur?7.5:5.5)*k;
   const txt=cur?ptName(p)+"  "+p.c:p.c;
   labels+=`<text class="lbl${cur?" cur":""}" x="${f1(tx)}" y="${f1(y+fs*0.36)}" font-size="${f1(fs)}" text-anchor="${right?"start":"end"}">${esc(txt)}</text>`;}
 }
 return out+`<g>${dots}</g><g>${labels}</g><g>${hits}</g>`;
}
const fig=$("#fig");
function drawFig(){fig.setAttribute("viewBox",S.vb.map(f1).join(" "));fig.innerHTML=figSVG(S.view,{vb:S.vb,sel:S.sel,pt:S.pt});}
let raf=0;
function goVB(target){cancelAnimationFrame(raf);const from=S.vb.slice();
 if(reduceMotion||S.tab!=="model"){S.vb=target.slice();drawFig();return;}
 const t0=performance.now(),D=340;
 const step=t=>{let u=Math.min(1,(t-t0)/D);u=1-Math.pow(1-u,3);S.vb=from.map((v,i)=>v+(target[i]-v)*u);
  fig.setAttribute("viewBox",S.vb.map(f1).join(" "));if(u<1)raf=requestAnimationFrame(step);else{S.vb=target.slice();drawFig();}};
 raf=requestAnimationFrame(step);}

/* ---------- model actions ---------- */
function setView(v){if(B3){S.view=v;renderModel();B3.view(v);return;}if(v===S.view)return;S.view=v;S.vb=ZOOMS[v][S.zoom].slice();if(S.pt&&PI[S.pt].v!==v)S.pt=null;renderModel();}
function setZoom(z){if(B3){S.zoom=z;renderZoomBar();B3.region(z);return;}S.zoom=z;renderZoomBar();goVB(ZOOMS[S.view][z]);}
function selectMer(id,opts={}){S.sel=id;S.pt=null;
 if(B3){if(id&&opts.switchView){S.view=MI[id].v;S.zoom="full";B3.view(S.view);}renderModel();return;}
 if(id&&opts.switchView&&!PATHS[id][S.view]){S.view=MI[id].v;S.zoom="full";S.vb=ZOOMS[S.view].full.slice();}
 if(opts.overview&&S.zoom!=="full"){S.zoom="full";renderModel();goVB(ZOOMS[S.view].full);return;}
 renderModel();}
function selectPt(code,opts={}){const p=PI[code];if(!p)return;if(!inSet(p)){S.set="all";store.set("jl_set","all");applyStatic();}S.pt=code;S.sel=p.m;
 if(B3){S.zoom=regionOf(p);renderModel();B3.focusPoint(code);if(opts.scroll&&matchMedia("(max-width:999px)").matches){$(".figwrap").scrollIntoView({behavior:reduceMotion?"auto":"smooth",block:"center"});}return;}
 let changed=false;if(p.v!==S.view){S.view=p.v;changed=true;}
 const [x,y]=resolve(p.v,p.at);const vb=S.vb;const inside=x>vb[0]&&x<vb[0]+vb[2]&&y>vb[1]&&y<vb[1]+vb[3];
 if(changed){S.zoom=regionOf(p);S.vb=ZOOMS[S.view].full.slice();renderModel();goVB(ZOOMS[S.view][S.zoom]);}
 else if(S.zoom==="full"||!inside){S.zoom=regionOf(p);renderModel();goVB(ZOOMS[S.view][S.zoom]);}
 else renderModel();
 if(opts.scroll&&matchMedia("(max-width:999px)").matches){$(".figwrap").scrollIntoView({behavior:reduceMotion?"auto":"smooth",block:"center"});}
}
function renderZoomBar(){$$("#zoomBar button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.zoom===S.zoom));}
function renderModel(){
 $$("#viewSeg button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.view===S.view));
 renderZoomBar();if(B3)B3.update({sel:S.sel,pt:S.pt});else drawFig();renderList();renderInfo();}

function renderList(){
 let h=`<div class="groups">`;
 GROUPS.forEach(([zh,en,ids])=>{h+=`<div class="mgroup"><h3>${bi(zh,en)}</h3>`;
  ids.forEach(id=>{const m=MI[id];h+=`<button class="mbtn" data-mer="${id}" style="--c:var(--m-${id})" aria-pressed="${S.sel===id}"><span class="dot"></span><span class="nm">${bi(m.s,m.es)}</span><span class="code">${id}</span></button>`;});
  h+=`</div>`;});
 h+=`<div class="mgroup"><button class="mbtn all-btn" data-mer="" style="--c:var(--muted)" aria-pressed="${!S.sel}"><span class="dot" style="background:conic-gradient(var(--m-LU),var(--m-ST),var(--m-HT),var(--m-BL),var(--m-GB),var(--m-LU))"></span><span class="nm">${bi("全部經絡","All meridians")}</span></button></div></div>`;
 h+=`<div class="elements" aria-label="五行">${ELS.map(e=>`<span><i style="background:var(--el-${e[2]})"></i>${bi(e[0],e[1])}</span>`).join("")}</div>`;
 $("#mlist").innerHTML=h;
}

function fact(zh,en,val){return `<dt>${bi(zh,en)}</dt><dd>${val}</dd>`;}
function renderInfo(){
 let h="";
 if(S.pt){const p=PI[S.pt],pm=MI[p.m],list=ptsOf(pm),i=list.indexOf(p);
  const big=S.lang==="en"?`<h2 class="pname latin">${esc(p.py)}</h2>`:`<h2 class="pname">${esc(p.zh)}</h2>`;
  const sub=S.lang==="zh"?`<p class="psub"><b>${esc(p.py)}</b></p>`:S.lang==="en"?`<p class="psub"><b>${esc(p.tr)}</b></p>`:`<p class="psub"><b>${esc(p.py)}</b> · ${esc(p.tr)}</p>`;
  h+=`<article class="card pcard" style="--c:var(--m-${p.m})">
   <div class="pc-top"><span class="code">${p.c}</span><button class="pc-mer" data-act="mer">${bi(pm.s,pm.es)}</button>
    <div class="pc-nav"><button data-act="prev" ${i<=0?"disabled":""} aria-label="上一個穴位 Previous point">‹</button><span>${i+1} / ${list.length}</span><button data-act="next" ${i>=list.length-1?"disabled":""} aria-label="下一個穴位 Next point">›</button></div></div>
   ${big}${sub}
   <div class="loc"><h3>${bi("定位","Location")}</h3>${S.lang!=="en"?`<p>${esc(p.lz)}</p>`:""}${S.lang!=="zh"?`<p class="${S.lang==="both"?"le":""}">${esc(p.le)}</p>`:""}</div>
   ${p.uz?`<div class="loc uses"><h3>${bi("主治","Traditional uses")}</h3>${S.lang!=="en"?`<p>${esc(p.uz)}</p>`:""}${S.lang!=="zh"?`<p class="${S.lang==="both"?"le":""}">${esc(p.ue)}</p>`:""}<p class="disc">${bi("傳統主治，只供學習，唔係醫療建議。","Traditional indications for study only, not medical advice.")}</p></div>`:""}
  </article>`;}
 if(S.sel){const m=MI[S.sel];
  const title=S.lang==="en"?`<h2 class="latin">${esc(m.en)}</h2>`:`<h2>${esc(m.zh)}</h2>`;
  const subt=S.lang==="both"?`<p>${esc(m.en)}</p>`:S.lang==="zh"?`<p>${esc(m.s)}${m.alias?" · 又稱 "+m.alias:""}</p>`:`<p>${esc(m.zh)}</p>`;
  let f="";
  if(m.org)f+=fact("臟腑","Organ",bi(m.org[0],m.org[1]));else f+=fact("類別","Type",bi("奇經八脈","Extraordinary vessel"));
  f+=fact("陰陽","Yin / Yang",m.six?bi(`${m.yy[0]} · ${m.six[0]}`,`${m.yy[1]} · ${m.six[1]}`):bi(m.yy[0],m.yy[1]));
  if(m.limb)f+=fact("手足","Limb",bi(m.limb[0],m.limb[1]));
  if(m.el)f+=fact("五行","Element",`<span class="swatch" style="background:var(--el-${m.el[2]})"></span>${bi(m.el[0],m.el[1])}`);
  if(m.br>=0)f+=fact("時辰","Peak hours",`${bi(BR[m.br][0]+"時",BR[m.br][1]+" hour")} <span class="mono" style="font-size:.9em">${brHours(m.br)}</span>`);
  f+=fact(m.mid?"相對":"表裡",m.mid?"Counterpart":"Paired with",`<button class="linkbtn" data-mer-link="${m.pair}">${bi(MI[m.pair].s,MI[m.pair].es)}</button> <span class="code" style="--c:var(--m-${m.pair})">${m.pair}</span>`);
  f+=fact("走向","Flow",bi(m.dir[0],m.dir[1]));
  f+=fact("穴位","Points",`<span class="mono">${m.n}</span> ${bi("穴","points")}`);
  const chips=ptsOf(m).map(p=>`<button class="pchip" data-pt="${p.c}" aria-pressed="${S.pt===p.c}"><b>${p.c}</b><span class="${S.lang==="en"?"latin":""}">${esc(S.lang==="en"?p.py:p.zh)}</span></button>`).join("");
  const viewNames={front:["正面","front"],back:["背面","back"],side:["側面","side"]};
  const hint=!B3&&!PATHS[m.id][S.view]?`<div class="viewhint">${bi(`呢條經喺${viewNames[S.view][0]}睇唔到。`,`Not visible from the ${viewNames[S.view][1]}.`)} <button class="linkbtn" data-goview="${m.v}">${bi("轉去"+viewNames[m.v][0],"Show "+viewNames[m.v][1])}</button></div>`:"";
  h+=`<article class="card mcard" style="--c:var(--m-${m.id})">
   <div class="mhead"><div class="badge">${m.id}</div><div>${title}${subt}</div></div>
   <dl class="facts">${f}</dl>${hint}
   <h3 class="sec-h" style="margin-top:16px">${bi("本模型收錄穴位","Points in this model")} · <span class="mono">${ptsOf(m).length}/${m.n}</span></h3>
   <div class="ptchips">${chips}</div>
  </article>`;}
 else{h+=`<article class="card"><div class="mhead"><div class="badge" style="background:var(--accent)">14</div><div><h2${S.lang==="en"?' class="latin"':""}>${bi("十四經","Fourteen meridians")}</h2><p>${bi("揀一條經絡睇路線同穴位","Pick a meridian to see its route and points")}</p></div></div>
  <p class="note">${bi("十二正經按時辰首尾相接：肺 → 大腸 → 胃 → 脾 → 心 → 小腸 → 膀胱 → 腎 → 心包 → 三焦 → 膽 → 肝，再返肺。","The twelve regular meridians link end to end in this order: Lung → Large Intestine → Stomach → Spleen → Heart → Small Intestine → Bladder → Kidney → Pericardium → Triple Energizer → Gallbladder → Liver, then back to Lung.")}</p></article>`;}
 $("#info").innerHTML=h;
}

/* ---------- search ---------- */
const norm=s=>s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[\s'’\-]/g,"");
const ALIAS={sj:"te",tb:"te",th:"te",ren:"cv",du:"gv",lv:"lr",ub:"bl"};
function search(q){q=norm(q);if(!q)return[];
 const mm=q.match(/^([a-z]+)(\d*)$/);if(mm&&ALIAS[mm[1]])q=ALIAS[mm[1]]+mm[2];
 const res=[];
 M.forEach(m=>{const keys=[m.id.toLowerCase(),norm(m.zh),norm(m.s),norm(m.en),norm(m.es),(m.alias||"").toLowerCase()];
  let sc=0;keys.forEach(k=>{if(!k)return;if(k===q)sc=Math.max(sc,100);else if(k.startsWith(q))sc=Math.max(sc,60);else if(k.includes(q))sc=Math.max(sc,30);});
  if(sc)res.push({t:"m",id:m.id,sc:sc+1});});
 P.forEach(p=>{const keys=[p.c.toLowerCase(),norm(p.zh),norm(p.py),norm(p.tr)];if(p.c==="GV26")keys.push("人中","renzhong");
  const uz=norm(p.uz),ue=p.ue.toLowerCase();if(q.length>=2&&(uz.includes(q)||ue.includes(q.replace(/\s/g,""))||ue.replace(/\s/g,"").includes(q))){res.push({t:"p",id:p.c,sc:(inSet(p)?14:10),use:true});}
  let sc=0;keys.forEach((k,i)=>{if(k===q)sc=Math.max(sc,100);else if(k.startsWith(q))sc=Math.max(sc,i===0?70:55);else if(k.includes(q))sc=Math.max(sc,25);});
  if(sc)res.push({t:"p",id:p.c,sc});});
 const best={};res.forEach(r=>{const k=r.t+r.id;if(!best[k]||best[k].sc<r.sc)best[k]=r;});
 return Object.values(best).sort((a,b)=>b.sc-a.sc).slice(0,10);}
let resIdx=-1,lastRes=[];
function showResults(){const q=$("#q").value.trim();const box=$("#results");
 if(!q){box.hidden=true;return;}lastRes=search(q);resIdx=lastRes.length?0:-1;
 box.innerHTML=lastRes.length?lastRes.map((r,i)=>{if(r.t==="m"){const m=MI[r.id];return `<button data-i="${i}" class="${i===resIdx?"act":""}"><span class="code" style="--c:var(--m-${m.id})">${m.id}</span><span class="r-main">${bi(m.zh,m.en)}</span></button>`;}
  const p=PI[r.id];return `<button data-i="${i}" class="${i===resIdx?"act":""}"><span class="code" style="--c:var(--m-${p.m})">${p.c}</span><span class="r-main">${esc(p.zh)} <small>${esc(p.py)} · ${esc(p.tr)}</small>${r.use?`<small class="r-use">${esc(S.lang==="en"?p.ue:p.uz)}</small>`:""}</span></button>`;}).join("")
  :`<div class="none">${bi("搵唔到。試下穴名、拼音或者代號，例如 合谷、hegu、LI4。","No match. Try a name, pinyin or code, e.g. 合谷, hegu, LI4.")}</div>`;
 box.hidden=false;}
function pickResult(i){const r=lastRes[i];if(!r)return;$("#results").hidden=true;$("#q").value="";$("#q").blur();
 if(r.t==="m")selectMer(r.id,{switchView:true,overview:true});else selectPt(r.id,{scroll:true});}

/* ---------- body clock ---------- */
function renderClock(){
 const now=new Date(),h=now.getHours(),mi=now.getMinutes(),cur=nowBr(),C=160;
 const pt=(r,a)=>[f1(C+r*Math.sin(a*Math.PI/180)),f1(C-r*Math.cos(a*Math.PI/180))];
 let s=`<svg class="dial" viewBox="0 0 320 320" role="img" aria-label="${esc(plain("子午流注時鐘","Meridian body clock"))}">`;
 s+=`<circle cx="${C}" cy="${C}" r="158" fill="var(--surface)" stroke="var(--line)"/>`;
 for(let i=0;i<12;i++){const id=BR_MER[i],a0=i*30-15,a1=i*30+15,isC=i===cur;
  const [x1,y1]=pt(150,a0),[x2,y2]=pt(150,a1),[x3,y3]=pt(100,a1),[x4,y4]=pt(100,a0);
  s+=`<path class="seg-a" data-mer="${id}" d="M${x1},${y1} A150,150 0 0 1 ${x2},${y2} L${x3},${y3} A100,100 0 0 0 ${x4},${y4} Z" style="fill:var(--m-${id});fill-opacity:${isC?.6:.24};stroke:var(--surface);stroke-width:1.5"><title>${esc(BR[i][0]+"時 "+brHours(i)+" "+MI[id].zh)}</title></path>`;
  if(isC){const [o1,o2]=pt(157,a0+1),[o3,o4]=pt(157,a1-1);s+=`<path d="M${o1},${o2} A157,157 0 0 1 ${o3},${o4}" style="fill:none;stroke:var(--m-${id});stroke-width:5;stroke-linecap:round"/>`;}
  const [bx,by]=pt(133,i*30),[cx,cy]=pt(112,i*30);
  s+=`<text class="bch" x="${bx}" y="${by}" style="font-weight:${isC?700:400}">${BR[i][0]}</text><text class="bcd" x="${cx}" y="${cy}">${id}</text>`;}
 for(let hh=0;hh<24;hh++){const [a,b]=pt(96,hh*15),[c,d]=pt(hh%2?88:92,hh*15);s+=`<line class="tick" x1="${a}" y1="${b}" x2="${c}" y2="${d}"/>`;
  if(hh%2){const [tx,ty]=pt(79,hh*15);s+=`<text class="hr" x="${tx}" y="${ty}">${hh}</text>`;}}
 const ang=(h+mi/60)*15,[hx,hy]=pt(146,ang);
 s+=`<line class="hand" x1="${C}" y1="${C}" x2="${hx}" y2="${hy}"/><circle cx="${C}" cy="${C}" r="4" fill="var(--ink)"/>`;
 const cm=MI[BR_MER[cur]];
 s+=`<text class="c-big" x="${C}" y="${C-20}">${S.lang==="en"?BR[cur][1]:BR[cur][0]+"時"}</text><text class="c-time" x="${C}" y="${C+22}">${pad(h)}:${pad(mi)}</text><text class="c-mer" x="${C}" y="${C+44}" style="fill:var(--m-${cm.id})">${esc(S.lang==="en"?cm.es:cm.s)}</text>`;
 $("#dial").innerHTML=s+"</svg>";
 $("#nowcard").innerHTML=`<h2>${bi(`而家係${BR[cur][0]}時`,`Now: ${BR[cur][1]} hour`)}</h2>
  <p>${bi(`${brHours(cur)}，${cm.zh}當令。`,`${brHours(cur)} — the ${cm.en} is at its peak.`)}</p>
  <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap"><button class="primary" data-show="${cm.id}">${bi("喺人體上睇","Show on the body")}</button></div>`;
 const order=[2,3,4,5,6,7,8,9,10,11,0,1];
 $("#brlist").innerHTML=order.map(i=>{const m=MI[BR_MER[i]];return `<li><button class="${i===cur?"cur":""}" data-show="${m.id}" style="--c:var(--m-${m.id})"><span class="b-ch">${BR[i][0]}<small>${BR[i][1]}</small></span><span class="b-h">${brHours(i)}</span><span class="b-m">${bi(m.s,m.es)}</span><span class="code">${m.id}</span></button></li>`;}).join("");
}

/* ---------- flashcards ---------- */
const FC={deck:store.get("jl_fc_deck","pt"),dir:store.get("jl_fc_dir","zh"),known:new Set(store.get("jl_known",[])),queue:[],flip:false,confirmReset:false};
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
function deckItems(){const it=[];if(FC.deck!=="pt")M.forEach(m=>it.push("m:"+m.id));if(FC.deck!=="mer")setPts().forEach(p=>it.push("p:"+p.c));return it;}
function buildQueue(){const all=deckItems();let q=all.filter(x=>!FC.known.has(x));if(!q.length)q=all.slice();FC.queue=shuffle(q);FC.flip=false;}
function faceHTML(key,side){const [t,id]=key.split(":");const zhFront=FC.dir==="zh";const showZh=(side==="front")===zhFront;
 if(t==="p"){const p=PI[id],m=MI[p.m];
  if(showZh)return `<div class="fc-kind">${bi("穴位","Point")}</div><div class="fc-big">${esc(p.zh)}</div>${side==="back"?`<div class="fc-sub"><span class="code" style="--c:var(--m-${p.m})">${p.c}</span> · ${esc(m.zh)}</div><div class="fc-loc">${esc(p.lz)}</div>${p.uz?`<div class="fc-use">${esc(p.uz)}</div>`:""}`:""}`;
  return `<div class="fc-kind">${bi("穴位","Point")}</div><div class="fc-big latin">${esc(p.tr)}</div><div class="fc-sub">${esc(p.py)}</div>${side==="back"?`<div class="fc-sub"><span class="code" style="--c:var(--m-${p.m})">${p.c}</span> · ${esc(m.en)}</div><div class="fc-loc">${esc(p.le)}</div>${p.ue?`<div class="fc-use">${esc(p.ue)}</div>`:""}`:""}`;}
 const m=MI[id];
 if(showZh)return `<div class="fc-kind">${bi("經絡","Meridian")}</div><div class="fc-big mid">${esc(m.zh)}</div>${side==="back"?`<div class="fc-sub"><span class="code" style="--c:var(--m-${m.id})">${m.id}</span>${m.br>=0?` · ${BR[m.br][0]}時 ${brHours(m.br)}`:""}${m.el?` · ${m.el[0]}`:""}</div>`:""}`;
 return `<div class="fc-kind">${bi("經絡","Meridian")}</div><div class="fc-big latin">${esc(m.en)}</div>${side==="back"?`<div class="fc-sub"><span class="code" style="--c:var(--m-${m.id})">${m.id}</span>${m.br>=0?` · ${BR[m.br][1]} hour ${brHours(m.br)}`:""}${m.el?` · ${m.el[1]}`:""}</div>`:""}`;}
function renderCards(){if(!FC.queue.length)buildQueue();const key=FC.queue[0];const [t,id]=key.split(":");const c=t==="p"?PI[id].m:id;
 const all=deckItems(),kn=all.filter(x=>FC.known.has(x)).length;
 const segBtn=(grp,val,zh,en,cur)=>`<button data-${grp}="${val}" aria-pressed="${cur===val}">${bi(zh,en)}</button>`;
 $("#cards").innerHTML=`<div class="ctrl"><div class="grp"><div class="seg">${segBtn("deck","mer","經絡","Meridians",FC.deck)}${segBtn("deck","pt","穴位","Points",FC.deck)}${segBtn("deck","all","全部","All",FC.deck)}</div>
  <div class="seg">${segBtn("dir","zh","中 → 英","ZH → EN",FC.dir)}${segBtn("dir","en","英 → 中","EN → ZH",FC.dir)}</div></div>
  <span class="progress">${bi("已識","Known")} ${kn} / ${all.length}</span></div>
  <div class="bar"><i style="width:${all.length?kn/all.length*100:0}%"></i></div>
  <div class="fc-card${FC.flip?" flip":""}" id="fcCard" tabindex="0" role="button" aria-label="${esc(plain("反轉閃卡","Flip card"))}" style="--c:var(--m-${c})">
   <div class="fc-inner"><div class="fc-face front" style="--c:var(--m-${c})">${faceHTML(key,"front")}</div><div class="fc-face back" style="--c:var(--m-${c})">${faceHTML(key,"back")}</div></div></div>
  <p class="fc-hint">${bi("撳張卡反轉，然後揀識唔識","Tap the card to flip, then mark it")}</p>
  <div class="fc-actions"><button class="again" data-fc="again">${bi("再溫","Again")}</button><button class="got" data-fc="got">${bi("識咗","Got it")}</button></div>
  <button class="reset" data-fc="reset">${FC.confirmReset?bi("再撳一次確認重設","Tap again to reset"):bi("重設進度","Reset progress")}</button>`;}
function fcAct(a){const key=FC.queue[0];
 if(a==="again"){FC.queue.push(FC.queue.shift());}
 else if(a==="got"){FC.known.add(key);store.set("jl_known",[...FC.known]);FC.queue.shift();if(!FC.queue.length)buildQueue();}
 else if(a==="reset"){if(!FC.confirmReset){FC.confirmReset=true;renderCards();return;}FC.known.clear();store.set("jl_known",[]);buildQueue();}
 FC.confirmReset=false;FC.flip=false;renderCards();}

/* ---------- quiz ---------- */
const Q={cur:null,total:0,right:0,streak:0,best:store.get("jl_best",0),answered:false};
const pick=a=>a[Math.floor(Math.random()*a.length)];
const sample=(a,n)=>shuffle(a.slice()).slice(0,n);
function newQ(){const r=Math.random();let q;
 const SP=setPts();
 if(r<0.55){const p=pick(SP);let pool=SP.filter(x=>x!==p&&x.v===p.v&&regionOf(x)===regionOf(p));if(pool.length<3)pool=SP.filter(x=>x!==p&&x.v===p.v);
  q={type:"where",p,opts:shuffle(sample(pool,3).concat([p])).map(o=>o.c),ans:p.c};}
 else if(r<0.85){const p=pick(SP);q={type:"name",p,sub:Math.random()<0.5?"tr":"code",opts:shuffle(sample(SP.filter(x=>x!==p),3).concat([p])).map(o=>o.c),ans:p.c};}
 else{const i=Math.floor(Math.random()*12);const id=BR_MER[i];q={type:"time",br:i,opts:shuffle(sample(BR_MER.filter(x=>x!==id),3).concat([id])),ans:id};}
 Q.cur=q;Q.answered=false;renderQuiz();}
function optLabel(q,key){
 if(q.type==="time"){const m=MI[key];return S.lang==="en"?esc(m.en):S.lang==="zh"?`<span class="zhn">${esc(m.zh)}</span>`:`<span class="zhn">${esc(m.zh)}</span><span class="sm">${esc(m.es)}</span>`;}
 const p=PI[key];
 if(q.type==="where")return S.lang==="en"?`${esc(p.py)}<span class="sm">${esc(p.tr)}</span>`:S.lang==="zh"?`<span class="zhn">${esc(p.zh)}</span>`:`<span class="zhn">${esc(p.zh)}</span><span class="sm">${esc(p.py)} · ${esc(p.tr)}</span>`;
 if(q.sub==="code")return `<span class="mono" style="font-weight:600">${p.c}</span>`;
 return S.lang==="en"?`<span class="zhn">${esc(p.zh)}</span>`:`${esc(p.tr)}`;}
function renderQuiz(){if(!Q.cur){newQ();return;}const q=Q.cur;let body="";
 if(q.type==="where"){const p=q.p;const vb=ZOOMS[p.v][regionOf(p)];
  body=`<p class="qprompt">${bi("亮起嗰個係咩穴？","Which point is glowing?")}</p><p class="qsub">${bi("提示：佢喺"+MI[p.m].zh+"上面","Hint: it sits on the "+MI[p.m].en)}</p>
   <div class="qfig"><svg viewBox="${vb.join(" ")}" preserveAspectRatio="xMidYMid meet">${figSVG(p.v,{vb,sel:p.m,pt:p.c,only:p.m,quiz:true})}</svg></div>`;}
 else if(q.type==="name"){const p=q.p;
  const show=S.lang==="en"&&q.sub==="tr"?`<div class="qbig latin">${esc(p.tr)}</div>`:`<div class="qbig">${esc(p.zh)}</div>`;
  const ask=q.sub==="code"?bi("呢個穴嘅代號係？","What is this point's code?"):S.lang==="en"?bi("呢個英文名對應邊個中文穴名？","Which Chinese name matches?"):bi("呢個穴嘅英文意譯係？","What is its English name?");
  body=`<p class="qprompt">${ask}</p>${show}`;}
 else{body=`<p class="qprompt">${bi(`${BR[q.br][0]}時（${brHours(q.br)}）係邊條經當令？`,`Which meridian peaks in the ${BR[q.br][1]} hour (${brHours(q.br)})?`)}</p>`;}
 const opts=q.opts.map(k=>{let cls="";if(Q.answered){if(k===q.ans)cls=" right";else if(k===Q.picked)cls=" wrong";}
  return `<button class="qopt${cls}" data-opt="${k}" ${Q.answered?"disabled":""}>${optLabel(q,k)}</button>`;}).join("");
 let fb="";
 if(Q.answered){const ok=Q.picked===q.ans;
  if(q.type==="time"){const m=MI[q.ans];fb=`<div class="qfb"><strong>${ok?bi("啱！","Correct!"):bi("差少少。","Not quite.")}</strong> ${bi(`${BR[q.br][0]}時係${m.zh}（${m.id}）。`,`${BR[q.br][1]} hour belongs to the ${m.en} (${m.id}).`)}</div>`;}
  else{const p=PI[q.ans];fb=`<div class="qfb"><strong>${ok?bi("啱！","Correct!"):bi("差少少。","Not quite.")}</strong> ${esc(p.zh)} · ${esc(p.py)} · <span class="mono">${p.c}</span> · ${esc(p.tr)}<br><span style="color:var(--muted)">${S.lang==="en"?esc(p.le):esc(p.lz)}</span></div>`;}
  fb+=`<button class="primary qnext" data-q="next">${bi("下一題","Next question")}</button>`;}
 $("#quiz").innerHTML=`<div class="qscore"><span>${bi("答對","Correct")}<b>${Q.right}/${Q.total}</b></span><span>${bi("連勝","Streak")}<b>${Q.streak}</b></span><span>${bi("最佳","Best")}<b>${Q.best}</b></span></div>
  <div class="qcard">${body}<div class="qopts">${opts}</div>${fb}</div>`;}
function answer(k){if(Q.answered)return;Q.answered=true;Q.picked=k;Q.total++;
 if(k===Q.cur.ans){Q.right++;Q.streak++;if(Q.streak>Q.best){Q.best=Q.streak;store.set("jl_best",Q.best);}}else Q.streak=0;renderQuiz();}

/* ---------- tabs & events ---------- */
const TABS=["model","clock","cards","quiz"];
function setTab(t,push=true){if(!TABS.includes(t))t="model";S.tab=t;
 TABS.forEach(x=>{$("#tab-"+x).hidden=x!==t;});$$(".tabs button").forEach(b=>b.setAttribute("aria-selected",b.dataset.tab===t));
 if(push&&location.hash!=="#"+t){try{history.replaceState(null,"","#"+t)}catch(e){location.hash=t}}
 renderTab();}
function renderTab(){if(S.tab==="model")renderModel();else if(S.tab==="clock")renderClock();else if(S.tab==="cards")renderCards();else renderQuiz();}

$("#langSeg").addEventListener("click",e=>{const b=e.target.closest("button[data-lang]");if(!b)return;S.lang=b.dataset.lang;store.set("jl_lang",S.lang);applyStatic();renderTab();});
$("#setSeg").addEventListener("click",e=>{const b=e.target.closest("button[data-set]");if(!b||b.dataset.set===S.set)return;S.set=b.dataset.set;store.set("jl_set",S.set);
 if(S.pt&&!inSet(PI[S.pt]))S.pt=null;buildQueue();Q.cur=null;applyStatic();renderTab();});
$(".tabs").addEventListener("click",e=>{const b=e.target.closest("button[data-tab]");if(b)setTab(b.dataset.tab);});
$("#viewSeg").addEventListener("click",e=>{const b=e.target.closest("button[data-view]");if(b)setView(b.dataset.view);});
$("#zoomBar").addEventListener("click",e=>{const b=e.target.closest("button[data-zoom]");if(b)setZoom(b.dataset.zoom);});
fig.addEventListener("click",e=>{const pt=e.target.closest("[data-pt]");if(pt){selectPt(pt.dataset.pt);return;}
 const mer=e.target.closest("[data-mer]");if(mer)selectMer(mer.dataset.mer);});
$("#mlist").addEventListener("click",e=>{const b=e.target.closest("button[data-mer]");if(b)selectMer(b.dataset.mer||null,{switchView:true,overview:true});});
$("#info").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
 if(b.dataset.pt){selectPt(b.dataset.pt,{scroll:true});return;}
 if(b.dataset.merLink){selectMer(b.dataset.merLink,{switchView:true,overview:true});return;}
 if(b.dataset.goview){setView(b.dataset.goview);return;}
 const a=b.dataset.act;if(!a)return;
 if(a==="mer"){S.pt=null;renderModel();return;}
 const p=PI[S.pt];if(!p)return;const list=ptsOf(MI[p.m]),i=list.indexOf(p);
 if(a==="prev"&&i>0)selectPt(list[i-1].c);if(a==="next"&&i<list.length-1)selectPt(list[i+1].c);});
const qi=$("#q");
qi.addEventListener("input",showResults);qi.addEventListener("focus",showResults);
qi.addEventListener("keydown",e=>{const box=$("#results");if(box.hidden)return;
 if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();if(!lastRes.length)return;resIdx=(resIdx+(e.key==="ArrowDown"?1:-1)+lastRes.length)%lastRes.length;$$("#results button").forEach((b,i)=>b.classList.toggle("act",i===resIdx));}
 else if(e.key==="Enter"){e.preventDefault();if(resIdx>=0)pickResult(resIdx);}
 else if(e.key==="Escape"){box.hidden=true;}});
$("#results").addEventListener("mousedown",e=>e.preventDefault());
$("#results").addEventListener("click",e=>{const b=e.target.closest("button[data-i]");if(b)pickResult(+b.dataset.i);});
document.addEventListener("click",e=>{if(!e.target.closest(".search"))$("#results").hidden=true;});
const showOnBody=id=>{S.sel=id;S.pt=null;S.view=MI[id].v;S.zoom="full";S.vb=ZOOMS[S.view].full.slice();setTab("model");};
$("#tab-clock").addEventListener("click",e=>{const b=e.target.closest("[data-show]");if(b){showOnBody(b.dataset.show);return;}
 const sg=e.target.closest(".seg-a");if(sg)showOnBody(sg.dataset.mer);});
$("#cards").addEventListener("click",e=>{const b=e.target.closest("button");
 if(b&&b.dataset.deck){FC.deck=b.dataset.deck;store.set("jl_fc_deck",FC.deck);buildQueue();renderCards();return;}
 if(b&&b.dataset.dir){FC.dir=b.dataset.dir;store.set("jl_fc_dir",FC.dir);FC.flip=false;renderCards();return;}
 if(b&&b.dataset.fc){fcAct(b.dataset.fc);return;}
 if(e.target.closest("#fcCard")){FC.flip=!FC.flip;$("#fcCard").classList.toggle("flip",FC.flip);}});
$("#cards").addEventListener("keydown",e=>{if(e.target.id==="fcCard"&&(e.key===" "||e.key==="Enter")){e.preventDefault();FC.flip=!FC.flip;e.target.classList.toggle("flip",FC.flip);}});
$("#quiz").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;if(b.dataset.opt)answer(b.dataset.opt);else if(b.dataset.q==="next")newQ();});
window.addEventListener("hashchange",()=>{const t=location.hash.slice(1);if(TABS.includes(t)&&t!==S.tab)setTab(t,false);});
setInterval(()=>{if(S.tab==="clock")renderClock();},30000);

/* ---------- 3D body ---------- */
function init3D(){
 const host=$("#stage3d");if(!host||!window.MA3D||!MA3D.supported())return;
 host.hidden=false;
 try{B3=MA3D.create({LIMBS,PATHS,P,M,MI,cr,resolve,sampleRoute,SIL},host,{inSet,ptName,
   isActive:()=>S.tab==="model"&&!document.hidden,onPoint:c=>selectPt(c),onMer:id=>selectMer(id)});}
 catch(e){console.error(e);B3=null;}
 if(!B3){host.hidden=true;return;}
 fig.hidden=true;document.body.classList.add("is3d");
 const sb=$('#viewSeg button[data-view="side"]');sb.dataset.zh="左側";sb.dataset.en="Left";
 const h=$(".fig-hint");h.dataset.zh="拖動旋轉 · 捏合或滾輪縮放 · 撳穴位睇詳情";h.dataset.en="Drag to rotate · pinch or scroll to zoom · tap a point";
 $("#ctl3d").addEventListener("click",e=>{const b=e.target.closest("button[data-z]");if(!b)return;
  if(b.dataset.z==="in")B3.zoomBy(0.72);else if(b.dataset.z==="out")B3.zoomBy(1.38);else{S.zoom="full";renderZoomBar();B3.view(S.view);}});
 B3.view(S.view);
}
init3D();
applyStatic();
setTab(TABS.includes(location.hash.slice(1))?location.hash.slice(1):"model",false);
})();
