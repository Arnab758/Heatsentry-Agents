import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Bus,
  Hospital,
  Globe,
  Flame,
  AlertTriangle,
  Droplets,
  Clock,
  CheckCircle,
  Wifi,
  Battery,
  Signal,
  Volume2,
  Square,
} from 'lucide-react';
import { HeatAlert, ZoneState } from '../types/heatsentry';
import { playSpeech, stopSpeech } from '../lib/multilingualSpeech';

interface BilingualDeviceSimulatorProps {
  alerts: HeatAlert[];
  zones: Record<string, ZoneState>;
}

export const BilingualDeviceSimulator: React.FC<BilingualDeviceSimulatorProps> = ({
  alerts,
  zones,
}) => {
  const [lang, setLang] = useState<'EN' | 'AR' | 'HI'>('EN');
  const [deviceTab, setDeviceTab] = useState<'PHONE_SMS' | 'TRANSIT_SIGN' | 'HOSPITAL_TRIAGE'>('PHONE_SMS');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const latestAlert = alerts[0] || {
    title: 'HEAT ADVISORY: Excessive Heat Risk',
    title_ar: 'تحذير من الإجهاد الحراري: خطر درجات حرارة قياسية',
    title_hi: 'अत्यधिक गर्मी चेतावनी: गंभीर तापीय संकट',
    message: 'Heat Index 112°F in Maryvale. Mandatory 15m shade rest cycle active.',
    message_ar: 'مؤشر الحرارة 112°F في ميريفيل. تطبيق دورة الراحة الإلزامية في الظل لمدة 15 دقيقة.',
    message_hi: 'मेरीवेल में हीट इंडेक्स 112°F। अनिवार्य 15 मिनट का छायादार विश्राम चक्र लागू।',
    action_required: 'Drink 1L electrolyte water per hour. Check in with site safety supervisor.',
    action_required_ar: 'شرب لتر من الماء مع الأملاح كل ساعة والتواصل فوراً مع مسؤول السلامة الميداني.',
    action_required_hi: 'प्रति घंटे 1 लीटर इलेक्ट्रोलाइट युक्त पानी पिएं। कार्यस्थल सुरक्षा सुपरवाइज़र से संपर्क करें।',
    timestamp: '02:30 PM',
    target_zone: 'PHX-02',
    severity: 'EXTREME',
  };

  const getAlertTitle = () => {
    if (lang === 'AR') return latestAlert.title_ar || 'تحذير حراري عالي: خطر الإجهاد الحراري الشديد في فينكس';
    if (lang === 'HI') return latestAlert.title_hi || 'अत्यधिक गर्मी चेतावनी: गंभीर तापीय संकट';
    return latestAlert.title;
  };

  const getAlertMessage = () => {
    if (lang === 'AR') return latestAlert.message_ar || 'مؤشر الحرارة في مستويات خطرة. تطبيق دورة الراحة الإلزامية في الظل وشرب المياه فوراً.';
    if (lang === 'HI') return latestAlert.message_hi || 'हीट इंडेक्स अत्यधिक उच्च स्तर पर है। अनिवार्य छाया और जलयोजन ब्रेक सक्रिय हैं।';
    return latestAlert.message;
  };

  const getAlertAction = () => {
    if (lang === 'AR') return latestAlert.action_required_ar || 'شرب لتر من الماء مع الأملاح كل ساعة والتواصل فوراً مع مسؤول السلامة الميداني.';
    if (lang === 'HI') return latestAlert.action_required_hi || 'प्रति घंटे 1 लीटर इलेक्ट्रोलाइट युक्त पानी पिएं और कार्यस्थल सुपरवाइज़र से संपर्क करें।';
    return latestAlert.action_required;
  };

  const handleSpeakAlert = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }

    const speakText = `${getAlertTitle()}. ${getAlertMessage()}. ${getAlertAction()}`;
    setIsSpeaking(true);

    playSpeech({
      lang: lang,
      text: speakText,
      onStart: () => {
        setIsSpeaking(true);
      },
      onEnd: () => {
        setIsSpeaking(false);
      },
      onError: () => {
        setIsSpeaking(false);
      },
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
      {/* Top Header */}
      <div className="p-3.5 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Multi-Channel Field Device Simulator
            </h3>
            <p className="text-[11px] text-slate-400">
              Trilingual Field Dispatch for Worker Smartphones, Transit Displays & Hospital Boards
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Device Tabs */}
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setDeviceTab('PHONE_SMS')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-semibold transition-all cursor-pointer ${
                deviceTab === 'PHONE_SMS'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Worker SMS
            </button>
            <button
              onClick={() => setDeviceTab('TRANSIT_SIGN')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-semibold transition-all cursor-pointer ${
                deviceTab === 'TRANSIT_SIGN'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              Valley Metro Sign
            </button>
            <button
              onClick={() => setDeviceTab('HOSPITAL_TRIAGE')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-semibold transition-all cursor-pointer ${
                deviceTab === 'HOSPITAL_TRIAGE'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Hospital className="w-3.5 h-3.5" />
              Trauma ER Board
            </button>
          </div>

          {/* Trilingual Toggle (EN / AR / HI) */}
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => {
                if (isSpeaking) {
                  stopSpeech();
                  setIsSpeaking(false);
                }
                setLang('EN');
              }}
              className={`px-2.5 py-1 rounded font-bold transition-all flex items-center gap-1 cursor-pointer ${
                lang === 'EN' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🇺🇸</span>
              <span>EN</span>
            </button>
            <button
              onClick={() => {
                if (isSpeaking) {
                  stopSpeech();
                  setIsSpeaking(false);
                }
                setLang('AR');
              }}
              className={`px-2.5 py-1 rounded font-bold transition-all flex items-center gap-1 cursor-pointer ${
                lang === 'AR'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="العربية (Arabic - UAE/MENA)"
            >
              <span>🇦🇪</span>
              <span>العربية</span>
            </button>
            <button
              onClick={() => {
                if (isSpeaking) {
                  stopSpeech();
                  setIsSpeaking(false);
                }
                setLang('HI');
              }}
              className={`px-2.5 py-1 rounded font-bold transition-all flex items-center gap-1 cursor-pointer ${
                lang === 'HI' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="हिंदी (Hindi)"
            >
              <span>🇮🇳</span>
              <span>हिन्दी</span>
            </button>
          </div>

          {/* Audio Announce Button */}
          <button
            onClick={handleSpeakAlert}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow ${
              isSpeaking
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
            }`}
            title="Listen to device voice readout"
          >
            {isSpeaking ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isSpeaking ? 'Stop Audio' : 'Play Audio'}</span>
          </button>
        </div>
      </div>

      {/* Simulator Body */}
      <div className="p-6 flex-1 flex items-center justify-center bg-slate-950/80 min-h-[420px]">
        {/* Device 1: Outdoor Worker Smartphone */}
        {deviceTab === 'PHONE_SMS' && (
          <div className="w-[310px] h-[490px] bg-slate-900 rounded-[36px] border-4 border-slate-700 shadow-2xl overflow-hidden flex flex-col relative ring-1 ring-slate-600">
            {/* Speaker & Camera Notch */}
            <div className="h-5 bg-slate-950 flex items-center justify-between px-5 text-[10px] text-slate-400 font-mono">
              <span>9:41</span>
              <div className="w-14 h-3 bg-slate-800 rounded-full mx-auto" />
              <div className="flex items-center gap-1">
                <Signal className="w-2.5 h-2.5" />
                <Wifi className="w-2.5 h-2.5" />
                <Battery className="w-3 h-3" />
              </div>
            </div>

            {/* SMS Header */}
            <div className="bg-slate-950 p-2.5 border-b border-slate-800 flex items-center gap-2 text-xs">
              <div className="w-7 h-7 rounded-full bg-rose-600 flex items-center justify-center font-bold text-white text-[10px]">
                HS
              </div>
              <div>
                <div className="font-bold text-white text-[11px]">HeatSentry City Alert (911-HEAT)</div>
                <div className="text-[9px] text-emerald-400">
                  {lang === 'AR' ? 'بث طوارئ بلدي معتمد ومشفر' : lang === 'HI' ? 'सत्यापित आपातकालीन प्रसारण' : 'Verified Emergency Broadcast'}
                </div>
              </div>
            </div>

            {/* Message Bubble Container */}
            <div className="p-3 space-y-2.5 flex-1 overflow-y-auto custom-scrollbar text-xs">
              <div className="text-center text-[9px] text-slate-500 my-1">
                Today • {latestAlert.timestamp} • Priority Alert
              </div>

              {/* Incoming Urgent SMS Bubble */}
              <div className="bg-slate-800 text-slate-100 p-3 rounded-2xl rounded-tl-sm border border-slate-700 space-y-2 shadow-md">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[11px]">
                  <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse shrink-0" />
                  <span>{getAlertTitle()}</span>
                </div>

                <p className="text-[11px] text-slate-200 leading-snug">
                  {getAlertMessage()}
                </p>

                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700 text-[10px] text-amber-300">
                  <strong>
                    {lang === 'AR' ? 'إجراءات السلامة الإلزامية (OSHA/MOHRE):' : lang === 'HI' ? 'अनिवार्य OSHA निर्देश:' : 'Mandatory OSHA Action:'}
                  </strong>{' '}
                  {getAlertAction()}
                </div>

                <div className="text-[9px] text-slate-400 text-right">
                  {lang === 'AR' ? 'تم الإرسال عبر شبكة الطوارئ البلدية • رسالة مجانية' : lang === 'HI' ? 'नगरपालिका संचार प्रणाली द्वारा प्रेषित • निःशुल्क' : 'Delivered via City Mesh • Free Msg'}
                </div>
              </div>
            </div>

            {/* Quick Reply Bar */}
            <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                disabled
                placeholder={
                  lang === 'AR'
                    ? 'أرسل "ظل" لمعرفة أقرب مأوى تبريد...'
                    : lang === 'HI'
                    ? 'निकटतम कूलिंग शेल्टर के लिए "SHADE" भेजें...'
                    : 'Reply "SHADE" for nearest mobile shelter...'
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-full px-3 py-1 text-[10px] text-slate-400"
              />
            </div>
          </div>
        )}

        {/* Device 2: Valley Metro Digital Bus Stop Sign */}
        {deviceTab === 'TRANSIT_SIGN' && (
          <div className="w-full max-w-lg bg-slate-950 rounded-2xl border-4 border-slate-700 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-600 text-white font-black text-sm">
                  VALLEY METRO
                </div>
                <div>
                  <div className="font-bold text-sm text-white">51st Ave & Indian School Transfer Hub</div>
                  <div className="text-[11px] text-indigo-400 font-mono">Maryvale Transit Center #4812</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-mono font-black text-amber-400">114°F</span>
                <span className="block text-[10px] text-rose-400 font-bold">
                  {lang === 'AR' ? 'إنذار حراري شديد' : lang === 'HI' ? 'अत्यधिक गर्मी चेतावनी' : 'EXTREME HEAT ALERT'}
                </span>
              </div>
            </div>

            <div className="bg-indigo-950/60 p-4 rounded-xl border border-indigo-500/40 space-y-2">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                <Bus className="w-5 h-5 text-indigo-400 animate-bounce shrink-0" />
                <span>
                  {lang === 'AR'
                    ? 'حافلة تبريد وتكييف متنقلة متوفرة في المحطة'
                    : lang === 'HI'
                    ? 'वातानुकूलित कूलिंग बस स्टॉप पर उपलब्ध (AC COOLING BUS)'
                    : 'MOBILE AIR-CONDITIONED COOLING BUS ON SITE'}
                </span>
              </div>
              <p className="text-xs text-slate-200">
                {lang === 'AR'
                  ? 'يرجى الصعود إلى حافلة التبريد الميدانية رقم #6014 للحصول على راحة مكيفة مجانية ومياه شرب مبردة. الخدمة متاحة للجميع وللعمال الميدانيين.'
                  : lang === 'HI'
                  ? 'निःशुल्क वातानुकूलित विश्राम और ठंडे पेयजल के लिए वैली मेट्रो बस #6014 पर जाएं। सभी पैदल यात्रियों और बाहरी श्रमिकों के लिए खुला है।'
                  : 'Board parked Valley Metro Bus #6014 for free air-conditioned rest and chilled bottled water. Open to all pedestrians and outdoor workers.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-slate-400 text-[10px]">
                    {lang === 'AR' ? 'مظلة الرذاذ والترطيب' : lang === 'HI' ? 'मिस्टिंग कैनोपी' : 'Misting Canopy'}
                  </div>
                  <div className="font-bold text-emerald-400">
                    {lang === 'AR' ? 'نشطة (تدفق مياه 100%)' : lang === 'HI' ? 'सक्रिय (100% जल प्रवाह)' : 'Active (100% Water Flow)'}
                  </div>
                </div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-slate-400 text-[10px]">
                    {lang === 'AR' ? 'حافلة التبريد التالية' : lang === 'HI' ? 'अगली कूल बस' : 'Next Cool Bus In'}
                  </div>
                  <div className="font-mono font-bold text-amber-300">4 min (Route 41)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Device 3: Hospital Trauma Intake Board */}
        {deviceTab === 'HOSPITAL_TRIAGE' && (
          <div className="w-full max-w-xl bg-slate-950 rounded-2xl border-4 border-slate-700 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-600 text-white font-black text-sm">
                  VALLEYWISE HEALTH
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Emergency Trauma & Hyperthermia Triage</div>
                  <div className="text-[11px] text-rose-400 font-mono">Trauma Level 1 Heat Stroke Bay</div>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-500 font-bold text-xs">
                  SURGE LEVEL 2
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">
                  {lang === 'AR' ? 'أحواض الغمر بالماء البارد' : lang === 'HI' ? 'आइस बाथ ट्रफ' : 'Cold-Water Immersion'}
                </div>
                <div className="text-xl font-mono font-black text-emerald-400">4 / 4 Ready</div>
                <div className="text-[9px] text-slate-500">Ice bath temp: 36°F</div>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">
                  {lang === 'AR' ? 'حالات الإجهاد الحراري الحالية' : lang === 'HI' ? 'वर्तमान हीट मरीज' : 'Current Heat Intakes'}
                </div>
                <div className="text-xl font-mono font-black text-amber-400">6 Patients</div>
                <div className="text-[9px] text-emerald-400">-72% due to HeatSentry</div>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">
                  {lang === 'AR' ? 'وقت وصول الإسعاف (ETA)' : lang === 'HI' ? 'आगमन समय (ETA)' : 'Inbound ETA'}
                </div>
                <div className="text-xl font-mono font-black text-cyan-400">1 Ambulance</div>
                <div className="text-[9px] text-slate-400">ETA 6 min from Maryvale</div>
              </div>
            </div>

            <div className="bg-rose-950/40 p-3 rounded-xl border border-rose-900/60 text-xs text-slate-300 space-y-1">
              <strong className="text-rose-400 block font-bold">
                {lang === 'AR' ? 'إشعار التنسيق والاستجابة الذاتية:' : lang === 'HI' ? 'स्वायत्त समन्वय सूचना:' : 'Autonomous Coordination Notice:'}
              </strong>
              <p className="text-[11px] leading-relaxed">
                {lang === 'AR'
                  ? 'ساهمت التدخلات المبكرة لنظام هيتسنتري من رش الرذاذ وتطبيق فترات الراحة الإلزامية في خفض حالات ضربات الشمس الحرجة المنقولة للمستشفى من 28 حالة متوقعة إلى 7 حالات فقط.'
                  : lang === 'HI'
                  ? 'मेरीवेल और अल्हाम्ब्रा में हीटसेंट्री के प्रारंभिक कूलिंग और अनिवार्य विश्राम उपायों से दोपहर के संभावित हीट-स्ट्रोक मामलों में 28 से घटकर 7 पर अप्रत्याशित नियंत्रण प्राप्त हुआ है।'
                  : 'HeatSentry early field misting and mandatory rest dispatches in Maryvale and Alhambra have reduced projected afternoon heat-stroke hospitalizations from 28 down to 7 patients.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
