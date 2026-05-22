import { useState, useContext, useMemo, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import {
  UploadCloud,
  MapPin,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Camera,
  FileText,
  Loader,
} from 'lucide-react';

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position} />;
};

const MapViewUpdater = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position && map) {
      console.log('🗺️ Map updating to:', position.lat, position.lng);
      setTimeout(() => {
        map.flyTo([position.lat, position.lng], 18, {
          duration: 0.5,
        });
      }, 0);
    }
  }, [position?.lat, position?.lng, map]);

  return null;
};

const categoryOptions = [
  { value: 'auto', label: 'Auto-classify using AI' },
  { value: 'Garbage', label: 'Garbage & Waste' },
  { value: 'Roads', label: 'Roads & Potholes' },
  { value: 'Streetlights', label: 'Street Lighting' },
  { value: 'Water', label: 'Water & Leaks' },
  { value: 'Other', label: 'Other' },
];

const priorityOptions = [
  { value: 'low', label: 'Low Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'high', label: 'High Emergency!' },
];

const predictCategory = (description) => {
  const lower = description.toLowerCase();
  if (lower.includes('pothole') || lower.includes('road') || lower.includes('asphalt')) return 'Roads';
  if (lower.includes('garbage') || lower.includes('trash') || lower.includes('litter')) return 'Garbage';
  if (lower.includes('light') || lower.includes('streetlight') || lower.includes('lamp')) return 'Streetlights';
  if (lower.includes('water') || lower.includes('leak') || lower.includes('sewer')) return 'Water';
  return 'Other';
};

const SubmitIssue = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'auto',
    priority: 'medium',
    address: '',
  });
  const [position, setPosition] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  const estimatedCategory = useMemo(() => {
    if (formData.category !== 'auto') return categoryOptions.find((item) => item.value === formData.category)?.label;
    if (!formData.description.trim()) return 'Waiting for your description…';
    const predicted = predictCategory(formData.description);
    return categoryOptions.find((item) => item.value === predicted)?.label || 'Other';
  }, [formData.category, formData.description]);

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (['dragenter', 'dragover'].includes(e.type)) setDragActive(true);
    if (['dragleave', 'drop'].includes(e.type)) setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
    setDragActive(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('❌ Geolocation is not supported by your browser. Please use a modern browser like Chrome, Firefox, or Edge.');
      return;
    }

    setLocationLoading(true);
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        const accuracy = pos.coords.accuracy;
        
        console.log('🎯 Location acquired successfully!');
        console.log('Latitude:', latitude);
        console.log('Longitude:', longitude);
        console.log('Accuracy:', accuracy, 'meters');
        
        setPosition({
          lat: latitude,
          lng: longitude,
        });
        
        setErrorMessage(`✓ Location confirmed! Accuracy: ${Math.round(accuracy)}m`);
        setLocationLoading(false);
      },
      (error) => {
        setLocationLoading(false);
        console.error('❌ Geolocation error:', error);

        let errorMsg = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = '❌ You denied location permission. Please enable it in browser settings and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = '❌ Your device could not determine its location. Try enabling GPS or moving to a place with better signal.';
            break;
          case error.TIMEOUT:
            errorMsg = '⏱️ Location request timed out. Check your GPS/network and try again.';
            break;
          default:
            errorMsg = `❌ Could not fetch location (${error.message}). Please pick a pin on the map manually.`;
        }
        setErrorMessage(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.title.trim() || !formData.description.trim()) {
        setErrorMessage('Please tell us what is happening and why it matters.');
        return false;
      }
    }
    if (step === 3 && !position) {
      setErrorMessage('Select the exact location so the right team can respond quickly.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const goNext = () => {
    if (!validateStep()) return;
    setStep((current) => Math.min(current + 1, 4));
  };

  const goBack = () => {
    setErrorMessage('');
    setStep((current) => Math.max(current - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category === 'auto' ? predictedCategoryValue(formData.description) : formData.category);
      data.append('priority', formData.priority);
      data.append('lat', position.lat);
      data.append('lng', position.lng);
      data.append('address', formData.address);
      if (image) data.append('image', image);

      await axios.post('http://localhost:5000/api/issues', data, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSubmitted(true);
      setTimeout(() => navigate('/'), 2200);
    } catch (err) {
      console.error(err);
      setErrorMessage('Unable to send your report right now. Try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const predictedCategoryValue = (description) => {
    const predicted = predictCategory(description);
    return categoryOptions.find((item) => item.value === predicted)?.value || 'Other';
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pt-6 pb-10">
      {submitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-10 text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300 shadow-[0_20px_60px_-30px_rgba(16,185,129,0.8)]">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-3xl font-semibold text-slate-100">Report sent successfully</h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            CivicEye AI+ has routed your issue to the right team. Thank you for making your city safer.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            Back to home
          </button>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <section className="glass-card p-8">
            <div className="mb-8 flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-2 text-sm text-sky-200">
                <Sparkles size={16} /> Smart multi-step report
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">Report a civic issue</p>
                <h1 className="mt-3 text-4xl font-semibold text-slate-100">Report a new issue with confidence.</h1>
                <p className="mt-4 max-w-2xl text-slate-400">Follow a guided flow that helps you describe the problem, attach evidence, choose the right location, and review everything before you submit.</p>
              </div>
            </div>

            <div className="mb-8 overflow-hidden rounded-[28px] bg-slate-950/80 p-1">
              <div className="grid grid-cols-4 gap-1 bg-slate-900/80 p-1">
                {['Details', 'Image', 'Location', 'Review'].map((label, index) => (
                  <div key={label} className={`rounded-3xl px-3 py-2 text-center text-xs uppercase tracking-[0.3em] transition ${step === index + 1 ? 'bg-sky-500 text-slate-950' : 'text-slate-400'}`}>
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {errorMessage && <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">{errorMessage}</div>}

              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-200">Issue overview</p>
                        <p className="text-sm text-slate-400">Tell the city what needs attention.</p>
                      </div>
                      <span className="rounded-full bg-slate-800/80 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-400">Step 1</span>
                    </div>

                    <label className="mb-2 block text-sm font-semibold text-slate-300">Issue title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={(e) => updateField('title', e.target.value)}
                      placeholder="Pothole growing near Elm Park"
                      className="w-full rounded-3xl border border-slate-700/80 bg-slate-900/90 px-5 py-4 text-slate-100 outline-none transition focus:border-sky-400/70"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-300">Description</label>
                    <textarea
                      rows={5}
                      name="description"
                      value={formData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      placeholder="Share details to help responders understand why this matters."
                      className="w-full rounded-3xl border border-slate-700/80 bg-slate-900/90 px-5 py-4 text-slate-100 outline-none transition focus:border-sky-400/70"
                    />
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <label className="block text-sm font-semibold text-slate-300">
                      Category
                      <select
                        value={formData.category}
                        onChange={(e) => updateField('category', e.target.value)}
                        className="mt-3 w-full rounded-3xl border border-slate-700/80 bg-slate-900/90 px-4 py-4 text-slate-100 outline-none transition focus:border-sky-400/70"
                      >
                        {categoryOptions.map((option) => (
                          <option key={option.value} value={option.value} className="bg-slate-950 text-slate-100">
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block text-sm font-semibold text-slate-300">
                      Priority
                      <select
                        value={formData.priority}
                        onChange={(e) => updateField('priority', e.target.value)}
                        className="mt-3 w-full rounded-3xl border border-slate-700/80 bg-slate-900/90 px-4 py-4 text-slate-100 outline-none transition focus:border-sky-400/70"
                      >
                        {priorityOptions.map((option) => (
                          <option key={option.value} value={option.value} className="bg-slate-950 text-slate-100">
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {formData.category === 'auto' && (
                    <div className="rounded-3xl border border-slate-700/80 bg-slate-900/90 p-4 text-sm text-slate-300">
                      <div className="flex items-center gap-2 text-sky-300">
                        <Sparkles size={18} />
                        <span className="font-semibold text-slate-100">AI Prediction</span>
                      </div>
                      <p className="mt-3">Based on your description, this report will likely be tagged as:</p>
                      <p className="mt-2 rounded-3xl bg-slate-950/90 px-4 py-3 text-slate-100">{estimatedCategory}</p>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-200">Capture evidence</p>
                      <p className="text-sm text-slate-400">Upload a photo or drag it into the frame.</p>
                    </div>
                    <span className="rounded-full bg-slate-800/80 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-400">Step 2</span>
                  </div>

                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`group rounded-[32px] border-2 ${dragActive ? 'border-sky-400/80 bg-slate-900/95' : 'border-dashed border-slate-700/80 bg-slate-950/80'} px-6 py-16 text-center transition`}
                  >
                    <UploadCloud size={40} className="mx-auto text-sky-300" />
                    <p className="mt-4 text-lg font-semibold text-slate-100">Drag & drop an image here</p>
                    <p className="mt-2 text-sm text-slate-400">Or choose a file from your device to show the issue clearly.</p>
                    <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-700/90 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-sky-400/40">
                      <Camera size={18} /> Select Photo
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                  </div>

                  {preview ? (
                    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/90">
                      <img src={preview} alt="Preview" className="h-80 w-full object-cover" />
                    </div>
                  ) : (
                    <div className="rounded-[28px] bg-slate-900/90 px-5 py-5 text-sm text-slate-400">No image selected yet. A clear photo helps the city respond faster.</div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-200">Choose the exact location</p>
                      <p className="text-sm text-slate-400">Pin the issue or use your current location.</p>
                    </div>
                    <span className="rounded-full bg-slate-800/80 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-400">Step 3</span>
                  </div>

                  <div className="rounded-[32px] overflow-hidden border border-white/10 bg-slate-950/90">
                    <MapContainer 
                      key={position ? `map-${Math.round(position.lat * 1000)}-${Math.round(position.lng * 1000)}` : 'map-initial'}
                      center={position ? [position.lat, position.lng] : [20, 0]} 
                      zoom={position ? 18 : 3} 
                      style={{ minHeight: '420px', width: '100%' }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                      <MapViewUpdater position={position} />
                      <LocationMarker position={position} setPosition={setPosition} />
                    </MapContainer>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <button
                      type="button"
                      onClick={getUserLocation}
                      disabled={locationLoading}
                      className={`inline-flex items-center justify-center gap-2 rounded-3xl px-5 py-4 text-sm font-semibold text-slate-950 transition ${
                        locationLoading
                          ? 'bg-sky-400/60 cursor-not-allowed opacity-70'
                          : 'bg-sky-500 hover:bg-sky-400'
                      }`}
                    >
                      {locationLoading ? (
                        <>
                          <Loader size={18} className="animate-spin" />
                          Fetching your location...
                        </>
                      ) : (
                        <>
                          <MapPin size={18} />
                          Use my location
                        </>
                      )}
                    </button>
                    <label className="block text-sm font-semibold text-slate-300">
                      Address / landmark (optional)
                      <input
                        value={formData.address}
                        onChange={(e) => updateField('address', e.target.value)}
                        placeholder="Near community center, park, or street"
                        className="mt-3 w-full rounded-3xl border border-slate-700/80 bg-slate-900/90 px-4 py-4 text-slate-100 outline-none transition focus:border-sky-400/70"
                      />
                    </label>
                  </div>

                  {position && (
                    <div className="space-y-4 rounded-3xl border border-amber-500/30 bg-amber-500/10 p-4">
                      <div className="text-sm">
                        <p className="font-semibold text-amber-300 mb-2">📍 Current Location: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}</p>
                        <p className="text-xs text-slate-400 mb-3">If this location is incorrect, you can edit below:</p>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs uppercase tracking-[0.1em] text-slate-300 mb-2">Latitude</label>
                            <input
                              type="number"
                              step="0.000001"
                              value={position.lat.toString()}
                              onChange={(e) => {
                                const newLat = parseFloat(e.target.value);
                                if (!isNaN(newLat)) {
                                  console.log('📍 Latitude changed to:', newLat);
                                  setPosition({ ...position, lat: newLat });
                                }
                              }}
                              onBlur={(e) => {
                                if (e.target.value === '') {
                                  setPosition({ ...position, lat: position.lat });
                                }
                              }}
                              className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-amber-400/70 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-xs uppercase tracking-[0.1em] text-slate-300 mb-2">Longitude</label>
                            <input
                              type="number"
                              step="0.000001"
                              value={position.lng.toString()}
                              onChange={(e) => {
                                const newLng = parseFloat(e.target.value);
                                if (!isNaN(newLng)) {
                                  console.log('📍 Longitude changed to:', newLng);
                                  setPosition({ ...position, lng: newLng });
                                }
                              }}
                              onBlur={(e) => {
                                if (e.target.value === '') {
                                  setPosition({ ...position, lng: position.lng });
                                }
                              }}
                              className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-amber-400/70 font-mono"
                            />
                          </div>
                          <p className="text-xs text-slate-400 italic pt-2">📍 Changes update the map instantly. Or click on the map above to pinpoint the exact location.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!position && (
                    <div className="rounded-3xl border border-slate-700/50 bg-slate-900/50 p-4 text-sm text-slate-300 space-y-2">
                      <p>📍 Choose location method:</p>
                      <ul className="text-xs text-slate-400 space-y-1 ml-2">
                        <li>• Click the button above to use your device's location</li>
                        <li>• Click directly on the map to drop a pin</li>
                        <li>• Or manually enter coordinates if you know them</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-200">Review & submit</p>
                      <p className="text-sm text-slate-400">Confirm all details including the exact location before submitting.</p>
                    </div>
                    <span className="rounded-full bg-slate-800/80 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-400">Step 4</span>
                  </div>

                  {/* Issue Details Section */}
                  <div className="space-y-4 rounded-[32px] border border-white/10 bg-slate-950/90 p-6 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.8)]">
                    <div className="flex items-start gap-4 border-b border-slate-800/60 pb-5">
                      <div className="rounded-3xl bg-slate-900/90 p-4 text-sky-300">
                        <FileText size={22} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Issue Title</p>
                        <p className="mt-2 text-lg font-semibold text-slate-100">{formData.title || 'No title yet'}</p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-3xl bg-slate-900/90 p-5">
                        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Description</p>
                        <p className="mt-3 text-sm text-slate-200 leading-relaxed">{formData.description || 'No description yet'}</p>
                      </div>
                      <div className="rounded-3xl bg-slate-900/90 p-5">
                        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Category</p>
                        <p className="mt-3 inline-block rounded-full bg-sky-500/20 px-3 py-1 text-sm font-semibold text-sky-300">{formData.category === 'auto' ? estimatedCategory : categoryOptions.find((item) => item.value === formData.category)?.label}</p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-3xl bg-slate-900/90 p-5">
                        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Priority Level</p>
                        <p className="mt-3 inline-block rounded-full bg-amber-500/20 px-3 py-1 text-sm font-semibold text-amber-300">{priorityOptions.find((item) => item.value === formData.priority)?.label}</p>
                      </div>
                      <div className="rounded-3xl bg-slate-900/90 p-5">
                        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Photo Evidence</p>
                        <p className="mt-3 text-sm text-slate-200">{preview ? '✓ Image uploaded' : '○ No image'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Exact Location Section */}
                  <div className="space-y-4 rounded-[32px] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-slate-950/90 p-6 shadow-[0_20px_60px_-40px_rgba(16,185,129,0.2)]">
                    <div className="flex items-center gap-3">
                      <div className="rounded-3xl bg-emerald-500/10 p-3 text-emerald-400">
                        <MapPin size={22} />
                      </div>
                      <div>
                        <p className="text-sm uppercase tracking-[0.24em] font-semibold text-emerald-400">Exact Location</p>
                        <p className="text-xs text-slate-400">GPS coordinates from your device</p>
                      </div>
                    </div>

                    {position ? (
                      <>
                        {/* Mini Map Preview */}
                        <div className="rounded-[28px] overflow-hidden border border-emerald-400/30 bg-slate-900/90 shadow-lg">
                          <MapContainer 
                            key={`review-map-${position.lat}-${position.lng}`}
                            center={[position.lat, position.lng]} 
                            zoom={18} 
                            style={{ minHeight: '280px', width: '100%' }}
                            dragging={false}
                            touchZoom={false}
                            scrollWheelZoom={false}
                            zoomControl={false}
                          >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                            <Marker position={[position.lat, position.lng]} />
                          </MapContainer>
                        </div>

                        {/* Coordinates Display */}
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="rounded-3xl bg-slate-900/80 p-5 border border-emerald-400/10">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Latitude</p>
                            <p className="mt-2 text-lg font-mono font-semibold text-emerald-400">{position.lat.toFixed(6)}</p>
                          </div>
                          <div className="rounded-3xl bg-slate-900/80 p-5 border border-emerald-400/10">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Longitude</p>
                            <p className="mt-2 text-lg font-mono font-semibold text-emerald-400">{position.lng.toFixed(6)}</p>
                          </div>
                        </div>

                        {/* Address Information */}
                        {formData.address && (
                          <div className="rounded-3xl bg-slate-900/80 p-5 border border-emerald-400/10">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Landmark / Address</p>
                            <p className="mt-2 text-slate-200 font-medium">{formData.address}</p>
                          </div>
                        )}

                        {!formData.address && (
                          <div className="rounded-3xl bg-slate-800/50 p-4 border border-slate-700/50 text-sm text-slate-400 italic">
                            No landmark or address provided (optional)
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="rounded-3xl bg-rose-500/10 border border-rose-500/30 p-5 text-center">
                        <p className="text-sm font-semibold text-rose-300">Location not selected</p>
                        <p className="mt-2 text-xs text-slate-400">Please go back and select a location or use "Use my location"</p>
                      </div>
                    )}
                  </div>

                  {/* Photo Preview Section */}
                  {preview && (
                    <div className="space-y-3 rounded-[32px] border border-white/10 bg-slate-950/90 p-6">
                      <p className="text-sm font-semibold text-slate-200 uppercase tracking-[0.24em]">Attached Photo Evidence</p>
                      <div className="overflow-hidden rounded-[28px] border border-white/10">
                        <img src={preview} alt="Issue preview" className="w-full object-cover max-h-96" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-slate-800/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === 1}
                  className="inline-flex items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/90 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <XCircle size={18} /> Back
                </button>
                <div className="flex flex-wrap items-center gap-3">
                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={goNext}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                    >
                      Continue
                      <ArrowRight size={18} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? 'Reporting...' : 'Report This Issue'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </section>

          <aside className="space-y-6 rounded-[32px] border border-white/10 bg-slate-950/80 p-8 shadow-[0_20px_80px_-50px_rgba(0,0,0,0.8)]">
            <div className="flex items-center gap-4 rounded-3xl bg-slate-900/90 p-5">
              <div className="rounded-3xl bg-sky-500/10 p-3 text-sky-300">
                <ShieldAlert size={20} />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">Your report preview</p>
                <p className="mt-2 text-sm text-slate-400">Review before you submit. Each step helps ensure the city has the right context.</p>
              </div>
            </div>

            <div className="space-y-4 rounded-[28px] border border-slate-800/80 bg-slate-900/90 p-5">
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Current step</span>
                <span>{step}/4</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${(step / 4) * 100}%` }} />
              </div>
            </div>

            <div className="space-y-4 rounded-[28px] border border-slate-800/80 bg-slate-900/90 p-5">
              <div className="flex items-center gap-3 text-slate-300">
                <Sparkles size={18} />
                <span className="text-sm font-semibold text-slate-100">Quick tips</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-400">
                <li>Use clear photos so crews can identify the issue instantly.</li>
                <li>Choose the exact pin location for faster response.</li>
                <li>Keep the title short and the description focused.</li>
              </ul>
            </div>

            <div className="space-y-4 rounded-[28px] border border-slate-800/80 bg-slate-900/90 p-5">
              <div className="flex items-center gap-3 text-slate-300">
                <Camera size={18} />
                <span className="text-sm font-semibold text-slate-100">What you can upload</span>
              </div>
              <p className="text-sm text-slate-400">Photos, screenshots, or evidence of damaged city infrastructure are great additions.</p>
              <div className="rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-300">
                {preview ? 'Image selected and ready to submit.' : 'No image selected yet.'}
              </div>
            </div>
          </aside>
        </motion.div>
      )}
    </div>
  );
};

export default SubmitIssue;
