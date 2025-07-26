export default function testimonial(){
    return (
        <section id="testimonials" className="testimonials section">
          {/* Section Title */}
          <div className="container section-title" data-aos="fade-up">
            <h2>Testimonials</h2>
            <p>What our clients say about us</p>
          </div>

          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="swiper testimonials-swiper">
              <div className="swiper-wrapper">
                {/* Testimonial Item 1 */}
                <div className="swiper-slide">
                  <div className="testimonial-item">
                    <p>
                      <i className="bi bi-quote quote-icon-left"></i>
                      <span>
                        "The service provided by SozoDigiCare was exceptional. The booking process was smooth, and the consultation was thorough and highly professional. I feel well cared for and informed about my health options." - Michael Thompson
                      </span>
                      <i className="bi bi-quote quote-icon-right"></i>
                    </p>
                    <img src="assets/img/testimonials/testimonials-1.jpg" className="testimonial-img" alt="Michael Thompson" />
                    <h3>Michael Thompson</h3>
                    <h4>Business Executive</h4>
                  </div>
                </div>
                {/* Testimonial Item 2 */}
                <div className="swiper-slide">
                  <div className="testimonial-item">
                    <p>
                      <i className="bi bi-quote quote-icon-left"></i>
                      <span>
                        "I had the most comfortable experience with SozoDigiCare. Their team was very understanding and professional. They provided me with the best options, and I’m now well on my way to recovery." - Linda Roberts
                      </span>
                      <i className="bi bi-quote quote-icon-right"></i>
                    </p>
                    <img src="assets/img/testimonials/testimonials-2.jpg" className="testimonial-img" alt="Linda Roberts" />
                    <h3>Linda Roberts</h3>
                    <h4>Teacher</h4>
                  </div>
                </div>
                {/* Testimonial Item 3 */}
                <div className="swiper-slide">
                  <div className="testimonial-item">
                    <p>
                      <i className="bi bi-quote quote-icon-left"></i>
                      <span>
                        "The medical staff at SozoDigiCare were incredibly supportive. They helped me through every step of my treatment, and their telemedicine services made it easy for me to access care, even from home." - David Green
                      </span>
                      <i className="bi bi-quote quote-icon-right"></i>
                    </p>
                    <img src="assets/img/testimonials/testimonials-3.jpg" className="testimonial-img" alt="David Green" />
                    <h3>David Green</h3>
                    <h4>Software Engineer</h4>
                  </div>
                </div>
                {/* Testimonial Item 4 */}
                <div className="swiper-slide">
                  <div className="testimonial-item">
                    <p>
                      <i className="bi bi-quote quote-icon-left"></i>
                      <span>
                        "SozoDigiCare’s team was very caring and attentive. I felt like I was in good hands throughout my entire consultation. I highly recommend them for anyone in need of quality healthcare." - Emily Davis
                      </span>
                      <i className="bi bi-quote quote-icon-right"></i>
                    </p>
                    <img src="assets/img/testimonials/testimonials-4.jpg" className="testimonial-img" alt="Emily Davis" />
                    <h3>Emily Davis</h3>
                    <h4>Freelancer</h4>
                  </div>
                </div>
                {/* Testimonial Item 5 */}
                <div className="swiper-slide">
                  <div className="testimonial-item">
                    <p>
                      <i className="bi bi-quote quote-icon-left"></i>
                      <span>
                        "My experience with SozoDigiCare has been wonderful. They have a user-friendly platform, and the medical professionals are top-notch. The whole process was seamless, and I felt well-supported." - John Wilson
                      </span>
                      <i className="bi bi-quote quote-icon-right"></i>
                    </p>
                    <img src="assets/img/testimonials/testimonials-5.jpg" className="testimonial-img" alt="John Wilson" />
                    <h3>John Wilson</h3>
                    <h4>Entrepreneur</h4>
                  </div>
                </div>
              </div>
              <div className="swiper-pagination"></div>
            </div>
          </div>
        </section>
    )
}