import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../../components/common/CustomButton';

const StorePreview: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const isRTL = i18n.language === 'ar' || i18n.language === 'ARABIC';
    const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
    const breadcrumb = [
        { name: t('sideBar.dashboard') || 'Dashboard', path: '/' },
        { name: t('sideBar.store') || 'Store', path: '/store-slider' },
        { name: t('sideBar.storePreview') || 'Store Preview', path: null },
    ];
    return (
        <div className="p-4 w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            <nav className="flex items-center text-gray-500 text-sm mb-4" aria-label="Breadcrumb">
                {breadcrumb.map((item, idx) => (
                    <React.Fragment key={item.name}>
                        <span
                            className={`text-primary font-semibold cursor-pointer ${idx === breadcrumb.length - 1 ? 'underline' : ''}`}
                            onClick={() => item.path && navigate(item.path)}
                            style={{ pointerEvents: item.path ? 'auto' : 'none', opacity: item.path ? 1 : 0.7 }}
                        >
                            {item.name}
                        </span>
                        {idx < breadcrumb.length - 1 && <span className="mx-2">/</span>}
                    </React.Fragment>
                ))}
            </nav>
            {/* Device Switcher */}
            <div className="flex flex-col sm:flex-row justify-center sm:gap-4 gap-2 mb-6 w-full sm:w-auto">
                <CustomButton
                    text={t('common.mobile') || 'Mobile'}
                    color={device === 'mobile' ? 'primary' : 'gray-200'}
                    textColor={device === 'mobile' ? 'white' : 'black'}
                    className="w-full sm:w-auto"
                    onClick={() => setDevice('mobile')}
                />
                <CustomButton
                    text={t('common.tablet') || 'Tablet'}
                    color={device === 'tablet' ? 'primary' : 'gray-200'}
                    textColor={device === 'tablet' ? 'white' : 'black'}
                    className="w-full sm:w-auto"
                    onClick={() => setDevice('tablet')}
                />
                <CustomButton
                    text={t('common.desktop') || 'Desktop'}
                    color={device === 'desktop' ? 'primary' : 'gray-200'}
                    textColor={device === 'desktop' ? 'white' : 'black'}
                    className="w-full sm:w-auto"
                    onClick={() => setDevice('desktop')}
                />
            </div>
            <div className="flex justify-center w-full overflow-x-auto">
                {device === 'mobile' && (
                    <div className="mobile">
                        <div className="phone">
                            <div className="phone-mirror">
                                <div className="topWrapper">
                                    <div className="camera"></div>
                                    <div className="line-rec"></div>
                                </div>
                                <iframe
                                    id="previewFrame"
                                    src="https://bringus.app/apex/f?p=345:29:1249936637431::::STORE_ID:22"
                                    title="Store Preview"
                                    style={{ flex: 1, width: '100%', height: '100%', border: 'none', borderRadius: '0 0 30px 30px' }}
                                />
                            </div>
                        </div>
                    </div>
                )}
                {device === 'tablet' && (
                    <div className="tablet">
                        <div className="tablet-frame">
                            <div className="tablet-mirror">
                                <div className="tablet-topWrapper">
                                    <div className="tablet-camera"></div>
                                    <div className="tablet-line-rec"></div>
                                </div>
                                <iframe
                                    id="previewFrame"
                                    src="https://bringus.app/apex/f?p=345:29:1249936637431::::STORE_ID:22"
                                    title="Store Preview"
                                    style={{ flex: 1, width: '100%', height: '100%', border: 'none', borderRadius: '0 0 20px 20px' }}
                                />
                            </div>
                        </div>
                    </div>
                )}
                {device === 'desktop' && (
                    <div className="desktop">
                        <div className="desktop-frame">
                            <div className="desktop-mirror">
                                <iframe
                                    id="previewFrame"
                                    src="https://bringus.app/apex/f?p=345:29:1249936637431::::STORE_ID:22"
                                    title="Store Preview"
                                    style={{ flex: 1, width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                .mobile, .tablet, .desktop {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100%;
                    margin-top: 1rem;
                    width: 100%;
                }
                .phone {
                    width: 350px;
                    height: 800px;
                    background: #222;
                    border-radius: 40px;
                    box-shadow: 0 0 20px rgba(0,0,0,0.2);
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    max-width: 95vw;
                    max-height: 85vh;
                }
                .phone-mirror {
                    width: 320px;
                    height: 740px;
                    background: #fff;
                    border-radius: 30px;
                    margin: auto;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                    max-width: 85vw;
                    max-height: 80vh;
                }
                .topWrapper {
                    width: 100%;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }
                .camera {
                    width: 60px;
                    height: 10px;
                    background: #333;
                    border-radius: 5px;
                    margin: 0 auto;
                    margin-top: 10px;
                }
                .line-rec {
                    width: 100%;
                    height: 2px;
                    background: #e0e0e0;
                    margin-top: 8px;
                }
                .tablet-frame {
                    width: 900px;
                    height: 900px;
                    background: #222;
                    border-radius: 30px;
                    box-shadow: 0 0 20px rgba(0,0,0,0.2);
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    max-width: 98vw;
                    max-height: 75vh;
                }
                .tablet-mirror {
                    width: 860px;
                    height: 860px;
                    background: #fff;
                    border-radius: 20px;
                    margin: auto;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                    max-width: 96vw;
                    max-height: 70vh;
                }
                .tablet-topWrapper {
                    width: 100%;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }
                .tablet-camera {
                    width: 40px;
                    height: 8px;
                    background: #333;
                    border-radius: 4px;
                    margin: 0 auto;
                    margin-top: 6px;
                }
                .tablet-line-rec {
                    width: 100%;
                    height: 2px;
                    background: #e0e0e0;
                    margin-top: 6px;
                }
                .desktop-frame {
                    width: 1200px;
                    height: 800px;
                    background: #222;
                    border-radius: 16px;
                    box-shadow: 0 0 20px rgba(0,0,0,0.2);
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    max-width: 99vw;
                    max-height: 80vh;
                }
                .desktop-mirror {
                    width: 1160px;
                    height: 760px;
                    background: #fff;
                    border-radius: 8px;
                    margin: auto;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                    max-width: 95vw;
                    max-height: 75vh;
                }
                @media (max-width: 900px) {
                    .desktop-frame {
                        width: 98vw;
                        height: 60vw;
                    }
                    .desktop-mirror {
                        width: 95vw;
                        height: 57vw;
                    }
                    .tablet-frame {
                        width: 98vw;
                        height: 70vw;
                    }
                    .tablet-mirror {
                        width: 96vw;
                        height: 68vw;
                    }
                }
                @media (max-width: 600px) {
                    .phone {
                        width: 98vw;
                        height: 110vw;
                        min-width: 200px;
                        min-height: 400px;
                    }
                    .phone-mirror {
                        width: 92vw;
                        height: 100vw;
                        min-width: 180px;
                        min-height: 370px;
                    }
                    .tablet-frame {
                        width: 99vw;
                        height: 90vw;
                    }
                    .tablet-mirror {
                        width: 97vw;
                        height: 88vw;
                    }
                    .desktop-frame {
                        width: 99vw;
                        height: 60vw;
                    }
                    .desktop-mirror {
                        width: 97vw;
                        height: 57vw;
                    }
                }
                @media (max-width: 400px) {
                    .phone {
                        width: 98vw;
                        height: 130vw;
                    }
                    .phone-mirror {
                        width: 96vw;
                        height: 120vw;
                    }
                }
            `}</style>
        </div>
    );
};

export default StorePreview; 