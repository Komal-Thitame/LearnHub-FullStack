import React from "react";
import"./style.css";
function FeaturesAndCareer() {
  return (
    <>
      {/* FEATURES */}
      <section className="features">
        <div className="card">
          <div className="icon">👨‍🏫</div>
          <h3>Expert Faculty</h3>
          <p>Learn from industry mentors.</p>
        </div>

        <div className="card">
          <div className="icon">💻</div>
          <h3>Modern Lab</h3>
          <p>Practice in high-tech environments.</p>
        </div>

        <div className="card">
          <div className="icon">🚀</div>
          <h3>Placement Support</h3>
          <p>Career guidance & job help.</p>
        </div>
      </section>

      {/* CAREER MAP */}
      <section className="career-ultra">
        <h2 className="ultra-title">CAREER MAP</h2>

        <svg className="ultra-curve" viewBox="0 0 1200 200">
          <defs>
            <linearGradient id="grad">
              <stop offset="0%" stopColor="#ff9800" />
              <stop offset="50%" stopColor="#00bcd4" />
              <stop offset="100%" stopColor="#8bc34a" />
            </linearGradient>
          </defs>

          <path
            className="animated-path"
            d="M0 100 Q150 0 300 100 T600 100 T900 100 T1200 100"
          />
        </svg>

        <div className="ultra-container">
          <div className="ultra-step">
            <div className="ultra-dot">🔍</div>
            <h3>Identification</h3>
            <p>
              We understand your interests, strengths, and career goals to
              guide you toward the right learning path.
            </p>
          </div>

          <div className="ultra-step">
            <div className="ultra-dot">🧭</div>
            <h3>Counselling</h3>
            <p>
              Our experts provide personal guidance and advice to help you
              choose suitable courses and plans.
            </p>
          </div>

          <div className="ultra-step">
            <div className="ultra-dot">📚</div>
            <h3>Courses</h3>
            <p>
              Learn industry-relevant skills through structured programs
              designed for real-world success.
            </p>
          </div>

          <div className="ultra-step">
            <div className="ultra-dot">🎓</div>
            <h3>Certification</h3>
            <p>
              Earn valuable certificates that validate your knowledge and boost
              your professional profile.
            </p>
          </div>

          <div className="ultra-step">
            <div className="ultra-dot">💬</div>
            <h3>Interview</h3>
            <p>
              Mock interviews and training sessions prepare you to confidently
              face recruiters.
            </p>
          </div>

          <div className="ultra-step">
            <div className="ultra-dot">🏆</div>
            <h3>Placement</h3>
            <p>
              We connect you with job opportunities and support you in starting
              your career journey.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default FeaturesAndCareer;