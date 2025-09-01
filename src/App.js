import React, { useState, useEffect, useRef } from 'react';
import './App.css'; // This now links to your stylesheet

const App = () => {
  const [theme, setTheme] = useState('dark');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [followerPos, setFollowerPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const animationRef = useRef(null);

  // --- EFFECT HOOKS ---

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Custom cursor animation (desktop only)
  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 769px)").matches;

    if (isDesktop) {
      document.body.classList.remove('no-custom-cursor');
      const cursor = document.querySelector('.cursor');
      const cursorFollower = document.querySelector('.cursor-follower');
      cursor.style.display = 'block';
      cursorFollower.style.display = 'block';

      let followerX = followerPos.x;
      let followerY = followerPos.y;

      const animateFollower = () => {
        followerX += (mousePos.x - followerX) * 0.2;
        followerY += (mousePos.y - followerY) * 0.2;
        
        setFollowerPos({ x: followerX, y: followerY });
        animationRef.current = requestAnimationFrame(animateFollower);
      };
      
      animationRef.current = requestAnimationFrame(animateFollower);
    } else {
        document.body.classList.add('no-custom-cursor');
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mousePos, followerPos.x, followerPos.y]);

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    const isDesktop = window.matchMedia("(min-width: 769px)").matches;
    if (isDesktop) {
        window.addEventListener('mousemove', handleMouseMove);
    }
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => setIsNavScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // --- HANDLER FUNCTIONS ---

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  
  const toggleNav = () => {
      setIsNavOpen(prev => {
          document.body.style.overflow = !prev ? 'hidden' : '';
          return !prev;
      });
  };

  const closeNav = () => {
    setIsNavOpen(false);
    document.body.style.overflow = '';
  };

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    const target = document.querySelector(targetId);
    if (target) {
      const offsetTop = target.offsetTop - 80;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
    if (isNavOpen) closeNav();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('Sending...');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: '001fb3bb-f09d-465e-8ec0-85c3b8e21c59',
          ...formData
        })
      });

      const result = await response.json();
      if (result.success) {
        setSubmitStatus('Sent successfully! ✓');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus(`Error: ${result.message}`);
      }
    } catch (error) {
      setSubmitStatus('Error! Please try again.');
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitStatus('');
      }, 3000);
    }
  };
  
  const handleHover = (isHovering) => {
    if (window.matchMedia("(min-width: 769px)").matches) {
        setIsHovering(isHovering);
    }
  };

  return (
    <>
      <div 
        className={`cursor ${isHovering ? 'grow' : ''}`}
        style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px) translate(-50%, -50%)` }}
      />
      <div 
        className={`cursor-follower ${isHovering ? 'hidden-follower' : ''}`}
        style={{ transform: `translate(${followerPos.x}px, ${followerPos.y}px) translate(-50%, -50%)` }}
      />
      <div className="bg-grid" />
      <div className="bg-gradient-orb" />

      <nav id="navbar" className={isNavScrolled ? 'scrolled' : ''}>
        <div className="nav-container">
          <div className="logo">{'<SN/>'}</div>
          <ul className={`nav-links ${isNavOpen ? 'nav-active' : ''}`}>
            <li className="close-menu" onClick={closeNav}><i className="fas fa-times"></i></li>
            <li><a href="#home" onClick={(e) => handleSmoothScroll(e, '#home')}>Home</a></li>
            <li><a href="#about" onClick={(e) => handleSmoothScroll(e, '#about')}>About</a></li>
            <li><a href="#skills" onClick={(e) => handleSmoothScroll(e, '#skills')}>Skills</a></li>
            <li><a href="#projects" onClick={(e) => handleSmoothScroll(e, '#projects')}>Projects</a></li>
            <li><a href="#experience" onClick={(e) => handleSmoothScroll(e, '#experience')}>Experience</a></li>
            <li><a href="#contact" onClick={(e) => handleSmoothScroll(e, '#contact')}>Contact</a></li>
            <li className="theme-toggle-li">
              <div className="theme-toggle" onClick={toggleTheme}>
                <i className="fas fa-moon"></i><i className="fas fa-sun"></i>
              </div>
            </li>
          </ul>
          <div className="hamburger-menu" onClick={toggleNav}><i className="fas fa-bars"></i></div>
        </div>
      </nav>

      <main>
        <section id="home" className="hero">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-badge">Available for opportunities</div>
              <h1 className="hero-title font-display">Sannut Nicholas</h1>
              <p className="hero-subtitle">UAV System Engineer</p>
              <p className="hero-description">
                A Mechanical Engineering student passionate about advancing next-generation drones, UAVs, 
                and autonomous systems. I specialize in designing, building, and programming custom aerial 
                platforms for surveillance, rescue, and industrial applications.
              </p>
              <div className="hero-actions">
                <a href="#contact" className="btn-primary" onClick={(e) => handleSmoothScroll(e, '#contact')} onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
                  <span>Let's Collaborate</span><i className="fas fa-arrow-right"></i>
                </a>
                <a href="#projects" className="btn-secondary" onClick={(e) => handleSmoothScroll(e, '#projects')} onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
                  <span>View Projects</span>
                </a>
                <a href="/resume.pdf" download className="btn-secondary" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
                  <span>Download Resume</span><i className="fas fa-file-arrow-down"></i>
                </a>
              </div>
            </div>
            <div className="hero-image-container">
              <img src="/passport.jpg" alt="Sannut Nicholas" />
            </div>
          </div>
        </section>

        <section id="about" className="section">
          <div className="section-header animate-on-scroll">
            <h2 className="section-title font-display">Engineering Excellence</h2>
            <p className="section-description">
              B.E. Mechanical Engineering student with expertise in UAV design, robotics, and automation. 
              Skilled in flight controller programming, CAD tools, and real-world drone applications 
              through hands-on projects and internships.
            </p>
          </div>
          <div className="stats-grid"style={{textAlign: 'center'}}>
            <div className="stat-card animate-on-scroll" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}style={{textAlign: 'center'}}>
              <div className="stat-number">Drone Technology and UAV</div>
            </div>
            <div className="stat-card animate-on-scroll" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}style={{textAlign: 'center'}}>
              <div className="stat-number">Hardware</div>
            </div>
            <div className="stat-card animate-on-scroll" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}style={{textAlign: 'center'}}>
              <div className="stat-number">Uav Production</div>
            </div>
            <div className="stat-card animate-on-scroll" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}style={{textAlign: 'center'}}>
              <div className="stat-number">2026</div><div className="stat-label">Graduate</div>
            </div>
          </div>
        </section>

        <section id="skills" className="section">
          <div className="section-header animate-on-scroll">
            <h2 className="section-title font-display">Skills & Technologies</h2>
            <p className="section-description">
              Specialized expertise in UAV systems, drone technology, and aerial platform development 
              with hands-on experience in flight controllers and autonomous systems.
            </p>
          </div>
          <div className="skills-grid">
            {/* Skill Categories */}
            <div className="skill-category animate-on-scroll" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
              <h3>UAV & Flight Systems</h3>
              <div className="skill-tags">
                {['DGCA Drone Pilot', 'UAV Design', 'Drone Design', 'Drone Testing', 'FPV Pilot'].map(skill => <span key={skill} className="skill-tag" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>{skill}</span>)}
              </div>
            </div>
            <div className="skill-category animate-on-scroll" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
              <h3>Flight Controllers</h3>
              <div className="skill-tags">
                {['KK 2.1.5', 'Pixhawk Cube Orange Plus', 'Pixhawk 2.4.8', 'K++', 'Speedybee F407', 'F7', 'Wino', 'Goku F722'].map(skill => <span key={skill} className="skill-tag" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>{skill}</span>)}
              </div>
            </div>
            <div className="skill-category animate-on-scroll" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
              <h3>Hardware & Integration</h3>
              <div className="skill-tags">
                {['Hardware Integration', 'Modelling and CAD', 'ESC Configuration', 'Servo Integration', 'Telemetry Systems'].map(skill => <span key={skill} className="skill-tag" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>{skill}</span>)}
              </div>
            </div>
            <div className="skill-category animate-on-scroll" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
              <h3>Software & Mission Planning</h3>
              <div className="skill-tags">
                {['Mission Planner', 'Pix 4', 'Arducopter', 'Jivi', 'Betaflight', 'Cleanflight', 'INAV'].map(skill => <span key={skill} className="skill-tag" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>{skill}</span>)}
              </div>
            </div>
            <div className="skill-category animate-on-scroll" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
              <h3>Design & CAD</h3>
              <div className="skill-tags">
                {['AutoCAD', 'SolidWorks', 'SolidEdge', 'Fusion 360', 'Creo', 'ZW CAD', 'Autodesk Fusion 360'].map(skill => <span key={skill} className="skill-tag" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>{skill}</span>)}
              </div>
            </div>
            <div className="skill-category animate-on-scroll" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
              <h3>Ground Control & Comm</h3>
              <div className="skill-tags">
                {['Ground Control Station', 'TBS Tango', 'Open TX', 'Edge TX', 'Telemetry', 'GPS Systems'].map(skill => <span key={skill} className="skill-tag" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>{skill}</span>)}
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className="section">
          <div className="section-header animate-on-scroll">
            <h2 className="section-title font-display">Featured Projects</h2>
            <p className="section-description">
              A collection of UAV and drone projects showcasing custom design, autonomous systems, 
              and innovative aerial solutions for various applications.
            </p>
          </div>
          <div className="projects-grid">
            {/* Project Cards */}
            <div className="project-card animate-on-scroll" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
              <div className="project-content">
                <div className="project-header">
                  <h3 className="project-title">Surveillance Using VTOL</h3>
                  <p className="project-description">
                    Designed a VTOL UAV for real-time surveillance using high-resolution sensors and cameras. 
                    It supports vertical takeoff, long flight time, and reliable monitoring in diverse terrains.
                  </p>
                </div>
                <div className="project-tech">
                  {['Pixhawk Flight Controller', 'ESC', 'Camera Module', 'GPS', 'Mission Planner'].map(tech => <span key={tech} className="tech-tag">{tech}</span>)}
                </div>
              </div>
            </div>
            <div className="project-card animate-on-scroll" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
              <div className="project-content">
                <div className="project-header">
                  <h3 className="project-title">Autonomous Fixed Wing UAV</h3>
                  <p className="project-description">
                    Developed an autonomous fixed-wing UAV with stable flight control for long-range aerial monitoring. 
                    Integrated real-time video transmission and automated navigation.
                  </p>
                </div>
                <div className="project-tech">
                  {['Pulsar LED Motor', 'Ready to Sky ESC', 'SpeedyBee Wing FC', 'Servos', 'ELRS', 'FPV Camera & VTX'].map(tech => <span key={tech} className="tech-tag">{tech}</span>)}
                </div>
              </div>
            </div>
            <div className="project-card animate-on-scroll" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
              <div className="project-content">
                <div className="project-header">
                  <h3 className="project-title">Dual-Drone Autonomous System</h3>
                  <p className="project-description">
                    Designed and developed a dual-drone system for disaster management with real-time survivor detection 
                    and aerial assistance using autonomous navigation and payload delivery.
                  </p>
                </div>
                <div className="project-tech">
                  {['T-Motor Antigravity 340KV', 'T-Motor Air ESC', 'RTX Base', 'Here 4 GPS', 'Tarot Frame', 'Pixhawk Cube'].map(tech => <span key={tech} className="tech-tag">{tech}</span>)}
                </div>
              </div>
            </div>
            <div className="project-card animate-on-scroll" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
              <div className="project-content">
                <div className="project-header">
                  <h3 className="project-title">Custom Drone with 1.5 kg Payload</h3>
                  <p className="project-description">
                    Developed a custom UAV capable of lifting 1.5 kg payload for research and industrial use. 
                    Integrated Pixhawk 2.4.8 with GPS and remote for precise flight control.
                  </p>
                </div>
                <div className="project-tech">
                  {['750KV Motor', 'T-Motor ESC', 'Pixhawk 2.4.8', 'M10 GPS', 'T12 Remote', '4S 9500mAh LiPo', 'Camera'].map(tech => <span key={tech} className="tech-tag">{tech}</span>)}
                </div>
              </div>
            </div>
            <div className="project-card animate-on-scroll" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
              <div className="project-content">
                <div className="project-header">
                  <h3 className="project-title">Long Range FPV Drone</h3>
                  <p className="project-description">
                    Built a custom long-range FPV drone designed for endurance and reliable night operations. 
                    Integrated night-vision gear and long-distance communication.
                  </p>
                </div>
                <div className="project-tech">
                  {['Mark 4 10" Frame', 'Goku F7 FC', 'Mamba 80A ESC', 'Tranis R9MM OTA', 'AKK Ultra Long Range VTX 3W', 'Foxeer Night Camera'].map(tech => <span key={tech} className="tech-tag">{tech}</span>)}
                </div>
              </div>
            </div>
            <div className="project-card animate-on-scroll" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
              <div className="project-content">
                <div className="project-header">
                  <h3 className="project-title">Heavy Lifter Drone - 7kg Payload</h3>
                  <p className="project-description">
                    Designed a heavy-lift UAV optimized for industrial and research applications with high thrust efficiency. 
                    Integrated Pixhawk Cube with Here 4 GPS and Skydroid H12 for precise control.
                  </p>
                </div>
                <div className="project-tech">
                  {['Tarot X4 Frame', 'T-Motor 340KV Motors', 'T-Motor 80A FOC ESCs', 'Pixhawk Cube', 'Here 4 GPS', 'Skydroid H12 Remote'].map(tech => <span key={tech} className="tech-tag">{tech}</span>)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="experience" className="section">
          <div className="section-header animate-on-scroll">
            <h2 className="section-title font-display">Experience</h2>
            <p className="section-description">
              Professional experience in UAV system engineering with hands-on expertise in 
              drone development, flight control systems, and industrial applications.
            </p>
          </div>
          <div className="experience-timeline">
            <div className="timeline-item animate-on-scroll">
              <div className="timeline-marker"></div>
              <div className="timeline-content" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
                <div className="timeline-date">2023 - 2025</div>
                <h3 className="timeline-title">UAV System Engineer</h3>
                <div className="timeline-company">Sri Eshwar Drone Tech Pvt Ltd</div>
                <p className="timeline-description">
                  I gained practical industrial exposure through an internship at Sri Eshwar Drone Tech Pvt Ltd (2023), 
                  where I developed and configured drones using Pixhawk and DJI Naza-M Lite flight controllers. 
                  My role involved system assembly, flight controller calibration, autonomous flight programming, 
                  and documenting processes for safety compliance. I also gained knowledge in basic fixed-wing 
                  programming and troubleshooting flight control systems.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="section">
          <div className="section-header animate-on-scroll">
            <h2 className="section-title font-display">Let's Build Something Amazing</h2>
            <p className="section-description">
              Ready to collaborate on your next UAV project? I'm always excited to work with 
              innovative teams and tackle challenging aerospace problems.
            </p>
          </div>
          <div className="contact-container">
            <div className="contact-info animate-on-scroll">
              <div className="contact-item" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
                <div className="contact-icon"><i className="fas fa-envelope"></i></div>
                <div className="contact-details"><h4>Email</h4><p>sannutnicholas.j2022mech@sece.ac.in</p></div>
              </div>
              <div className="contact-item" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
                <div className="contact-icon"><i className="fas fa-phone"></i></div>
                <div className="contact-details"><h4>Phone</h4><p>+91 6381663662</p></div>
              </div>
              <div className="contact-item" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
                <div className="contact-icon"><i className="fas fa-map-marker-alt"></i></div>
                <div className="contact-details"><h4>Location</h4><p>Coimbatore</p></div>
              </div>
              <div className="social-links">
                <a href="https://www.linkedin.com/in/sannutnicholas/" target="_blank" rel="noopener noreferrer" className="social-link linkedin" title="LinkedIn" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}><i className="fab fa-linkedin-in"></i></a>
                <a href="https://www.instagram.com/mr._.fut._.baller?utm_source=ig_web_button_share_sheet&igsh=MW51c2gxaGRqcGE3NQ==" target="_blank" rel="noopener noreferrer" className="social-link instagram" title="Instagram" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}><i className="fab fa-instagram"></i></a>
                <a href="https://wa.me/916381663662" target="_blank" rel="noopener noreferrer" className="social-link whatsapp" title="WhatsApp" onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}><i className="fab fa-whatsapp"></i></a>              </div>
            </div>
            <form onSubmit={handleFormSubmit} className="contact-form animate-on-scroll">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input type="text" id="name" name="name" className="form-control" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input type="email" id="email" name="email" className="form-control" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input type="text" id="subject" name="subject" className="form-control" value={formData.subject} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea id="message" name="message" className="form-control" value={formData.message} onChange={handleInputChange} required></textarea>
              </div>
              <button type="submit" className="btn-primary" disabled={isSubmitting} onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
                <span>{submitStatus || 'Send Message'}</span>
                {!isSubmitting && <i className="fas fa-paper-plane"></i>}
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-content">
          <p className="footer-text">
            © 2025 <span>Prithiv Raj K</span>. Crafted with precision and passion.
          </p>
        </div>
      </footer>
    </>
  );
};

export default App;