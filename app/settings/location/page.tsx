'use client';
import { useState } from 'react';
import { ArrowLeft, MapPin, Check, Navigation, Maximize2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NoisePattern } from '@/components/noise-pattern';

export default function LocationSettings() {
  const router = useRouter();
  const [selectedDistricts, setSelectedDistricts] = useState(['ЦАО', 'СВАО', 'ВАО']);
  const [workRadius, setWorkRadius] = useState(15);
  const [hasChanges, setHasChanges] = useState(false);

  const moscowDistricts = [
    { id: 'CAO', name: 'ЦАО', fullName: 'Центральный АО' },
    { id: 'SAO', name: 'САО', fullName: 'Северный АО' },
    { id: 'SVAO', name: 'СВАО', fullName: 'Северо-Восточный АО' },
    { id: 'VAO', name: 'ВАО', fullName: 'Восточный АО' },
    { id: 'UVAO', name: 'ЮВАО', fullName: 'Юго-Восточный АО' },
    { id: 'UAO', name: 'ЮАО', fullName: 'Южный АО' },
    { id: 'UZAO', name: 'ЮЗАО', fullName: 'Юго-Западный АО' },
    { id: 'ZAO', name: 'ЗАО', fullName: 'Западный АО' },
    { id: 'SZAO', name: 'СЗАО', fullName: 'Северо-Западный АО' },
    { id: 'ZELENAO', name: 'ЗелАО', fullName: 'Зеленоградский АО' },
    { id: 'TROIZK', name: 'ТАО', fullName: 'Троицкий АО' },
    { id: 'NOVOMOSKOVSK', name: 'НАО', fullName: 'Новомосковский АО' }
  ];

  const moscowRegion = [
    { id: 'NORTH', name: 'Север МО', areas: 'Химки, Долгопрудный, Мытищи' },
    { id: 'SOUTH', name: 'Юг МО', areas: 'Подольск, Домодедово' },
    { id: 'EAST', name: 'Восток МО', areas: 'Балашиха, Реутов, Железнодорожный' },
    { id: 'WEST', name: 'Запад МО', areas: 'Одинцово, Красногорск' }
  ];

  const toggleDistrict = (districtId: string) => {
    setSelectedDistricts(prev => 
      prev.includes(districtId)
        ? prev.filter(d => d !== districtId)
        : [...prev, districtId]
    );
    setHasChanges(true);
  };

  const selectAll = () => {
    setSelectedDistricts(moscowDistricts.map(d => d.name));
    setHasChanges(true);
  };

  const clearAll = () => {
    setSelectedDistricts([]);
    setHasChanges(true);
  };

  const handleSave = async () => {
    console.log('Saving location settings...', { selectedDistricts, workRadius });
    setHasChanges(false);
    router.back();
  };

  return (
    <div style={{
      height: '100vh',
      backgroundImage: 'url(/images/bg-dashboard.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <NoisePattern />

      <header style={{
        position: 'relative',
        background: 'rgba(42, 42, 42, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 20,
        flexShrink: 0,
      }}>
        <div className="h-16 flex items-center justify-between px-4">
          <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white font-montserrat font-700 text-xl">Локация</h1>
          {hasChanges && (
            <button onClick={handleSave} className="text-[#E85D2F] font-montserrat font-700 text-sm">
              Сохранить
            </button>
          )}
          {!hasChanges && <div className="w-10"></div>}
        </div>
      </header>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
        zIndex: 10,
      }} className="px-4 py-6 pb-24">
        {/* Info Banner */}
        <div className="bg-[#BFFF00]/10 border border-[#BFFF00]/30 rounded-xl p-4">
          <div className="flex gap-3">
            <MapPin className="w-5 h-5 text-[#BFFF00] flex-shrink-0" />
            <div>
              <h3 className="font-montserrat font-700 text-white mb-1 text-sm">
                Больше районов = больше работы
              </h3>
              <p className="text-xs text-white font-montserrat font-500 leading-relaxed">
                Чем больше районов вы выберете, тем больше подходящих смен вы увидите в ленте
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-montserrat font-800 text-white mb-1">
              {selectedDistricts.length}
            </p>
            <p className="text-xs text-white font-montserrat font-500">Выбрано районов</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-montserrat font-800 text-[#BFFF00] mb-1">
              ~{selectedDistricts.length * 15}
            </p>
            <p className="text-xs text-white font-montserrat font-500">Смен в неделю</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="flex-1 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-montserrat font-700 text-white text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Maximize2 className="w-4 h-4" />
            Все районы
          </button>
          <button
            onClick={clearAll}
            className="flex-1 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-montserrat font-700 text-white text-sm transition-colors"
          >
            Очистить
          </button>
        </div>

        {/* Moscow Districts */}
        <div>
          <h3 className="text-xs font-montserrat font-700 text-white uppercase tracking-wider mb-3 px-1">
            Административные округа Москвы
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {moscowDistricts.map((district) => {
              const isSelected = selectedDistricts.includes(district.name);
              return (
                <button
                  key={district.id}
                  onClick={() => toggleDistrict(district.name)}
                  className={`relative h-16 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'bg-[#E85D2F]/10 border-[#E85D2F]'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="font-montserrat font-800 text-white text-lg">
                      {district.name}
                    </p>
                    <p className="text-[10px] text-white/50 font-montserrat font-500">
                      {district.fullName.split(' ')[0]}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-[#E85D2F] rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Moscow Region */}
        <div>
          <h3 className="text-xs font-montserrat font-700 text-white uppercase tracking-wider mb-3 px-1">
            Московская область
          </h3>
          <div className="space-y-2">
            {moscowRegion.map((region) => {
              const isSelected = selectedDistricts.includes(region.id);
              return (
                <button
                  key={region.id}
                  onClick={() => toggleDistrict(region.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'bg-[#FFD60A]/10 border-[#FFD60A]'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left flex-1">
                      <h4 className="font-montserrat font-700 text-white mb-1">
                        {region.name}
                      </h4>
                      <p className="text-xs text-white font-montserrat font-500">
                        {region.areas}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 bg-[#FFD60A] rounded-full flex items-center justify-center flex-shrink-0 ml-3">
                        <Check className="w-4 h-4 text-black" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Work Radius */}
        <div>
          <h3 className="text-xs font-montserrat font-700 text-white uppercase tracking-wider mb-3 px-1">
            Радиус работы
          </h3>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-[#E85D2F]" />
                <span className="font-montserrat font-700 text-white">
                  До {workRadius} км от дома
                </span>
              </div>
              <span className="text-2xl font-montserrat font-800 text-[#E85D2F]">
                {workRadius} км
              </span>
            </div>
            
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={workRadius}
              onChange={(e) => {
                setWorkRadius(parseInt(e.target.value));
                setHasChanges(true);
              }}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #E85D2F 0%, #E85D2F ${(workRadius-5)/45*100}%, rgba(255,255,255,0.1) ${(workRadius-5)/45*100}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
            
            <div className="flex justify-between mt-2">
              <span className="text-xs text-white/50 font-montserrat font-500">5 км</span>
              <span className="text-xs text-white/50 font-montserrat font-500">50 км</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
