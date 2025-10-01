import { NewsletterTemplate } from "./types";

export const newsletterTemplates: NewsletterTemplate[] = [
  {
    id: "start-from-scratch",
    name: "Start from scratch",
    category: "newsletter",
    thumbnail: "/images/templates/blank-template.svg",
    description: "Build your newsletter from a blank canvas with complete creative control.",
    content: "",
    isCustom: true,
  },
  {
    id: "company-newsletter",
    name: "Company Newsletter",
    category: "newsletter",
    thumbnail: "/images/templates/company-newsletter.jpg",
    description: "Professional newsletter template for company updates and announcements.",
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset='UTF-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <title>Company Newsletter</title>
</head>
<body style='margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;'>
  <table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color:#f4f4f4; padding:20px;'>
    <tr>
      <td align='center'>
        <table width='600' border='0' cellspacing='0' cellpadding='0' style='background:#ffffff; border-radius:8px; overflow:hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>
          <!-- Header -->
          <tr>
            <td style='background:#007bff; padding:30px; text-align:center;'>
              <img src='https://gothamenterprisesltd.com/assets/img/full_logo_dark.svg' alt='Gotham Enterprises Logo' style='display:block; margin:0 auto; max-width:200px; filter: brightness(0) invert(1); margin-bottom:20px;'>
              <h1 style='color:#ffffff; font-size:28px; margin:15px 0 5px; font-weight:bold;'>Company Newsletter</h1>
              <p style='color:#ffffff; font-size:16px; margin:0; opacity:0.9;'>Stay updated with our latest news and updates</p>
            </td>
          </tr>
          
          <!-- Hero Section -->
          <tr>
            <td style='padding:0;'>
              <img src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCA0NjAwIDI1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSIyNTAiIGZpbGw9InVybCgjZ3JhZGllbnQwKSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudDAiIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzAwN2JmZiIvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwMDU2YjMiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K' alt='Newsletter Header' style='width:100%; display:block; height:200px; object-fit:cover;'>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style='padding:40px 30px; text-align:left; color:#333;'>
              <h2 style='color:#007bff; font-size:24px; margin:0 0 20px; font-weight:bold;'>This Month's Highlights</h2>
              <p style='font-size:16px; line-height:1.6; margin:0 0 25px; color:#555;'>We're excited to share some incredible updates and achievements from our team this month. From new product launches to company milestones, here's everything you need to know.</p>
              
              <!-- Feature Articles -->
              <div style='margin:30px 0;'>
                <h3 style='color:#333; font-size:20px; margin:0 0 15px; font-weight:bold;'>🚀 New Product Launch</h3>
                <p style='font-size:16px; line-height:1.6; margin:0 0 20px; color:#555;'>We're thrilled to announce the launch of our latest innovation that will revolutionize how teams collaborate and communicate.</p>
                
                <h3 style='color:#333; font-size:20px; margin:25px 0 15px; font-weight:bold;'>📈 Q3 Performance</h3>
                <p style='font-size:16px; line-height:1.6; margin:0 0 20px; color:#555;'>Our third quarter results exceeded all expectations, with a 35% increase in customer satisfaction and 28% growth in revenue.</p>
                
                <h3 style='color:#333; font-size:20px; margin:25px 0 15px; font-weight:bold;'>🎉 Team Achievements</h3>
                <p style='font-size:16px; line-height:1.6; margin:0 0 25px; color:#555;'>Congratulations to our amazing team members who received industry recognition this month for their outstanding contributions.</p>
              </div>
              
              <!-- CTA Button -->
              <div style='text-align:center; margin:35px 0;'>
                <a href='#' style='background:#007bff; color:#ffffff; padding:15px 30px; border-radius:6px; text-decoration:none; font-weight:bold; font-size:16px; display:inline-block; box-shadow: 0 2px 4px rgba(0,123,255,0.3);'>Read Full Newsletter</a>
              </div>
            </td>
          </tr>
          
          <!-- Stats Section -->
          <tr>
            <td style='background:#f8f9fa; padding:30px; text-align:center;'>
              <h3 style='color:#333; font-size:20px; margin:0 0 25px; font-weight:bold;'>By The Numbers</h3>
              <table width='100%' cellpadding='15' style='margin:0 auto;'>
                <tr>
                  <td width='33%' style='text-align:center; padding:10px;'>
                    <div style='background:#007bff; color:white; padding:20px; border-radius:8px; margin-bottom:10px;'>
                      <h4 style='font-size:28px; margin:0; font-weight:bold;'>150+</h4>
                      <p style='font-size:14px; margin:5px 0 0; opacity:0.9;'>New Clients</p>
                    </div>
                  </td>
                  <td width='33%' style='text-align:center; padding:10px;'>
                    <div style='background:#28a745; color:white; padding:20px; border-radius:8px; margin-bottom:10px;'>
                      <h4 style='font-size:28px; margin:0; font-weight:bold;'>98%</h4>
                      <p style='font-size:14px; margin:5px 0 0; opacity:0.9;'>Satisfaction</p>
                    </div>
                  </td>
                  <td width='33%' style='text-align:center; padding:10px;'>
                    <div style='background:#ffc107; color:white; padding:20px; border-radius:8px; margin-bottom:10px;'>
                      <h4 style='font-size:28px; margin:0; font-weight:bold;'>24/7</h4>
                      <p style='font-size:14px; margin:5px 0 0; opacity:0.9;'>Support</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Upcoming Events -->
          <tr>
            <td style='padding:30px; text-align:left; color:#333;'>
              <h3 style='color:#007bff; font-size:20px; margin:0 0 20px; font-weight:bold;'>📅 Upcoming Events</h3>
              <div style='border-left:4px solid #007bff; padding-left:20px; margin:15px 0;'>
                <h4 style='color:#333; font-size:16px; margin:0 0 5px; font-weight:bold;'>Annual Company Conference</h4>
                <p style='color:#666; font-size:14px; margin:0;'>December 15-17, 2025 | Virtual & In-Person</p>
              </div>
              <div style='border-left:4px solid #28a745; padding-left:20px; margin:15px 0;'>
                <h4 style='color:#333; font-size:16px; margin:0 0 5px; font-weight:bold;'>Product Demo Webinar</h4>
                <p style='color:#666; font-size:14px; margin:0;'>November 28, 2025 | 2:00 PM EST</p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style='background:#333; padding:30px; text-align:center; color:#ffffff;'>
              <p style='font-size:14px; margin:0 0 15px; opacity:0.8;'>Thank you for being part of our community!</p>
              <p style='font-size:12px; margin:0; opacity:0.6;'>You received this email because you subscribed to our newsletter.</p>
              <p style='font-size:12px; margin:10px 0 0; opacity:0.6;'>
                <a href='#' style='color:#007bff; text-decoration:none;'>Unsubscribe</a> | 
                <a href='#' style='color:#007bff; text-decoration:none;'>Update Preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    id: "job-opportunities",
    name: "Job Opportunities",
    category: "newsletter",
    thumbnail: "/images/templates/job-opportunities.jpg",
    description: "Perfect for sharing weekly job listings and career opportunities.",
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset='UTF-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <title>Weekly Job Opportunities</title>
</head>
<body style='margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f8f9fa;'>
  <table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color:#f8f9fa; padding:20px;'>
    <tr>
      <td align='center'>
        <table width='600' border='0' cellspacing='0' cellpadding='0' style='background:#ffffff; border-radius:8px; overflow:hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>
          <!-- Header -->
          <tr>
            <td style='background:#28a745; padding:30px; text-align:center; color:#ffffff;'>
              <img src='https://gothamenterprisesltd.com/assets/img/full_logo_dark.svg' alt='Gotham Enterprises Logo' style='display:block; margin:0 auto; max-width:180px; filter: brightness(0) invert(1); margin-bottom:20px;'>
              <h1 style='font-size:32px; margin:0 0 10px; font-weight:bold;'>Weekly Job Opportunities</h1>
              <p style='font-size:18px; margin:0; opacity:0.9;'>Latest Openings</p>
              <p style='font-size:14px; margin:15px 0 0; opacity:0.8;'>Discover exciting career opportunities tailored for you</p>
            </td>
          </tr>
          
          <!-- Featured Job -->
          <tr>
            <td style='padding:30px; text-align:center; background:linear-gradient(135deg, #28a745 0%, #20c997 100%); color:#ffffff;'>
              <h2 style='font-size:24px; margin:0 0 15px; font-weight:bold;'>🌟 Featured Job</h2>
              <div style='background:rgba(255,255,255,0.1); padding:25px; border-radius:10px; text-align:left;'>
                <h3 style='color:#ffffff; font-size:20px; margin:0 0 10px;'>Senior Software Engineer</h3>
                <p style='color:#ffffff; opacity:0.9; margin:0 0 10px; font-size:16px;'>TechCorp Inc. • Remote • $120,000 - $150,000</p>
                <p style='color:#ffffff; opacity:0.8; font-size:14px; line-height:1.5; margin:0 0 15px;'>Join our innovative team to build cutting-edge applications using React, Node.js, and cloud technologies. Work with a talented team on products used by millions.</p>
                <a href='#' style='background:#ffffff; color:#28a745; padding:12px 25px; border-radius:6px; text-decoration:none; font-weight:bold; display:inline-block;'>Apply Now</a>
              </div>
            </td>
          </tr>
          
          <!-- Job Listings -->
          <tr>
            <td style='padding:30px;'>
              <h2 style='color:#28a745; font-size:24px; margin:0 0 25px; text-align:center; font-weight:bold;'>Latest Job Openings</h2>
              
              <!-- Job 1 -->
              <div style='border:1px solid #e9ecef; border-radius:8px; padding:20px; margin:0 0 20px; background:#f8f9fa;'>
                <div style='display:table; width:100%;'>
                  <div style='display:table-cell; vertical-align:top;'>
                    <h3 style='color:#333; font-size:18px; margin:0 0 8px; font-weight:bold;'>Product Manager</h3>
                    <p style='color:#666; font-size:14px; margin:0 0 10px;'>InnovateLabs • San Francisco, CA • $100,000 - $130,000</p>
                    <p style='color:#555; font-size:14px; line-height:1.5; margin:0 0 15px;'>Lead product strategy and roadmap for our AI-powered analytics platform. Work cross-functionally with engineering, design, and marketing teams.</p>
                    <div style='margin:10px 0 0;'>
                      <span style='background:#28a745; color:white; padding:4px 8px; border-radius:4px; font-size:12px; margin-right:8px;'>Full-time</span>
                      <span style='background:#17a2b8; color:white; padding:4px 8px; border-radius:4px; font-size:12px; margin-right:8px;'>Product</span>
                      <span style='background:#ffc107; color:white; padding:4px 8px; border-radius:4px; font-size:12px;'>Senior Level</span>
                    </div>
                  </div>
                </div>
                <a href='#' style='color:#28a745; text-decoration:none; font-weight:bold; font-size:14px;'>View Details →</a>
              </div>
              
              <!-- Job 2 -->
              <div style='border:1px solid #e9ecef; border-radius:8px; padding:20px; margin:0 0 20px; background:#f8f9fa;'>
                <h3 style='color:#333; font-size:18px; margin:0 0 8px; font-weight:bold;'>UX/UI Designer</h3>
                <p style='color:#666; font-size:14px; margin:0 0 10px;'>DesignStudio • Remote • $80,000 - $110,000</p>
                <p style='color:#555; font-size:14px; line-height:1.5; margin:0 0 15px;'>Create beautiful and intuitive user experiences for our web and mobile applications. Collaborate with product teams to deliver exceptional designs.</p>
                <div style='margin:10px 0 0;'>
                  <span style='background:#28a745; color:white; padding:4px 8px; border-radius:4px; font-size:12px; margin-right:8px;'>Full-time</span>
                  <span style='background:#e83e8c; color:white; padding:4px 8px; border-radius:4px; font-size:12px; margin-right:8px;'>Design</span>
                  <span style='background:#fd7e14; color:white; padding:4px 8px; border-radius:4px; font-size:12px;'>Mid Level</span>
                </div>
                <a href='#' style='color:#28a745; text-decoration:none; font-weight:bold; font-size:14px; display:block; margin-top:10px;'>View Details →</a>
              </div>
              
              <!-- Job 3 -->
              <div style='border:1px solid #e9ecef; border-radius:8px; padding:20px; margin:0 0 20px; background:#f8f9fa;'>
                <h3 style='color:#333; font-size:18px; margin:0 0 8px; font-weight:bold;'>Data Scientist</h3>
                <p style='color:#666; font-size:14px; margin:0 0 10px;'>DataCorp • New York, NY • $110,000 - $140,000</p>
                <p style='color:#555; font-size:14px; line-height:1.5; margin:0 0 15px;'>Analyze complex datasets and build predictive models to drive business insights. Work with machine learning algorithms and statistical analysis.</p>
                <div style='margin:10px 0 0;'>
                  <span style='background:#28a745; color:white; padding:4px 8px; border-radius:4px; font-size:12px; margin-right:8px;'>Full-time</span>
                  <span style='background:#6f42c1; color:white; padding:4px 8px; border-radius:4px; font-size:12px; margin-right:8px;'>Data</span>
                  <span style='background:#ffc107; color:white; padding:4px 8px; border-radius:4px; font-size:12px;'>Senior Level</span>
                </div>
                <a href='#' style='color:#28a745; text-decoration:none; font-weight:bold; font-size:14px; display:block; margin-top:10px;'>View Details →</a>
              </div>
            </td>
          </tr>
          
          <!-- Career Tips -->
          <tr>
            <td style='background:#f8f9fa; padding:30px;'>
              <h3 style='color:#28a745; font-size:20px; margin:0 0 20px; text-align:center; font-weight:bold;'>💡 Career Tips This Week</h3>
              <div style='text-align:left;'>
                <h4 style='color:#333; font-size:16px; margin:0 0 10px; font-weight:bold;'>1. Optimize Your LinkedIn Profile</h4>
                <p style='color:#555; font-size:14px; line-height:1.5; margin:0 0 20px;'>Make sure your LinkedIn profile is complete with a professional photo, compelling headline, and detailed work experience.</p>
                
                <h4 style='color:#333; font-size:16px; margin:0 0 10px; font-weight:bold;'>2. Practice Your Interview Skills</h4>
                <p style='color:#555; font-size:14px; line-height:1.5; margin:0 0 20px;'>Prepare for common interview questions and practice your responses. Research the company and prepare thoughtful questions.</p>
                
                <h4 style='color:#333; font-size:16px; margin:0 0 10px; font-weight:bold;'>3. Build Your Network</h4>
                <p style='color:#555; font-size:14px; line-height:1.5; margin:0;'>Attend industry events, join professional groups, and connect with peers in your field. Networking can open doors to new opportunities.</p>
              </div>
            </td>
          </tr>
          
          <!-- CTA Section -->
          <tr>
            <td style='padding:30px; text-align:center;'>
              <h3 style='color:#333; font-size:20px; margin:0 0 15px; font-weight:bold;'>Ready to Find Your Dream Job?</h3>
              <p style='color:#666; font-size:16px; margin:0 0 25px;'>Join thousands of professionals who have found their perfect career match</p>
              <a href='#' style='background:#28a745; color:#ffffff; padding:15px 30px; border-radius:6px; text-decoration:none; font-weight:bold; font-size:16px; display:inline-block; box-shadow: 0 2px 4px rgba(40,167,69,0.3);'>Browse All Jobs</a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style='background:#333; padding:20px; text-align:center; color:#ffffff;'>
              <p style='font-size:14px; margin:0 0 10px; opacity:0.8;'>Weekly Job Opportunities Newsletter</p>
              <p style='font-size:12px; margin:0; opacity:0.6;'>
                <a href='#' style='color:#28a745; text-decoration:none;'>Unsubscribe</a> | 
                <a href='#' style='color:#28a745; text-decoration:none;'>Manage Preferences</a> | 
                <a href='#' style='color:#28a745; text-decoration:none;'>Contact Us</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    id: "welcome-email",
    name: "Welcome Email",
    category: "welcome",
    thumbnail: "/images/templates/welcome-email.jpg",
    description: "Warm welcome message for new users and subscribers.",
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset='UTF-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <title>Welcome!</title>
</head>
<body style='margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;'>
  <table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color:#f4f4f4; padding:20px;'>
    <tr>
      <td align='center'>
        <table width='600' border='0' cellspacing='0' cellpadding='0' style='background:#ffffff; border-radius:8px; overflow:hidden;'>
          <tr>
            <td style='background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding:40px; text-align:center;'>
              <h1 style='color:#ffffff; font-size:32px; margin:0;'>Welcome!</h1>
              <p style='color:#ffffff; font-size:18px; margin:10px 0 0;'>We're excited to have you join us</p>
            </td>
          </tr>
          <tr>
            <td style='padding:40px; text-align:center; color:#333;'>
              <h2 style='color:#667eea; font-size:24px; margin:0 0 20px;'>Thank you for joining our community!</h2>
              <p style='font-size:16px; line-height:1.6; margin-bottom:30px;'>We're here to help you succeed and make the most of your experience with us. Here's what you can expect:</p>
              
              <div style='text-align:left; margin:30px 0;'>
                <h3 style='color:#667eea; font-size:20px; margin:0 0 15px;'>What's Next?</h3>
                <ul style='font-size:16px; line-height:1.6; color:#666;'>
                  <li style='margin-bottom:10px;'>Complete your profile to get personalized recommendations</li>
                  <li style='margin-bottom:10px;'>Browse our extensive library of resources</li>
                  <li style='margin-bottom:10px;'>Connect with other community members</li>
                  <li style='margin-bottom:10px;'>Join our upcoming webinars and events</li>
                </ul>
              </div>
              
              <div style='background:#f8f9fa; padding:25px; border-radius:8px; margin:30px 0; text-align:left;'>
                <h3 style='color:#667eea; font-size:18px; margin:0 0 15px;'>Quick Start Guide</h3>
                <p style='font-size:14px; line-height:1.5; color:#666; margin:0;'>Check out our quick start guide to make the most of your membership. Learn about all the features and benefits available to you.</p>
              </div>
              
              <p style='text-align:center; margin:30px 0;'>
                <a href='#' style='background:#667eea; color:#ffffff; padding:15px 30px; border-radius:6px; text-decoration:none; font-weight:bold; display:inline-block;'>Get Started Now</a>
              </p>
              
              <div style='border-top:1px solid #eee; padding-top:30px; margin-top:40px;'>
                <h3 style='color:#667eea; font-size:18px; margin:0 0 20px;'>Need Help?</h3>
                <p style='font-size:14px; line-height:1.5; color:#666;'>Our support team is here to help you every step of the way. Don't hesitate to reach out if you have any questions.</p>
                <p style='font-size:14px; line-height:1.5; color:#666;'>Contact us at: <a href='mailto:support@example.com' style='color:#667eea;'>support@example.com</a></p>
              </div>
            </td>
          </tr>
          <tr>
            <td style='background:#f8f9fa; padding:30px; text-align:center; font-size:14px; color:#777;'>
              <p style='margin:0 0 10px;'>Thanks for joining us!</p>
              <p style='margin:0;'>The Team</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    id: "event-invitation",
    name: "Event Invitation",
    category: "event",
    thumbnail: "/images/templates/event-invitation.jpg",
    description: "Professional event invitation template for corporate events.",
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset='UTF-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <title>Event Invitation</title>
</head>
<body style='margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;'>
  <table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color:#f4f4f4; padding:20px;'>
    <tr>
      <td align='center'>
        <table width='600' border='0' cellspacing='0' cellpadding='0' style='background:#ffffff; border-radius:8px; overflow:hidden;'>
          <tr>
            <td style='background:#ff6b35; padding:30px; text-align:center;'>
              <h1 style='color:#ffffff; font-size:28px; margin:0;'>You're Invited!</h1>
              <p style='color:#ffffff; font-size:16px; margin:10px 0 0;'>Join us for an exclusive event</p>
            </td>
          </tr>
          <tr>
            <td style='padding:30px; text-align:left; color:#333;'>
              <h2 style='color:#ff6b35; font-size:22px; margin:0 0 15px;'>Annual Leadership Summit 2024</h2>
              <p style='font-size:16px; line-height:1.6; margin-bottom:25px;'>We would love to have you attend our upcoming leadership summit where industry experts will share insights on the future of business and innovation.</p>
              
              <div style='background:#fff5f2; padding:25px; border-radius:8px; margin:25px 0; border-left:4px solid #ff6b35;'>
                <h3 style='color:#ff6b35; font-size:18px; margin:0 0 15px;'>Event Details</h3>
                <table style='width:100%; font-size:14px; line-height:1.6;'>
                  <tr>
                    <td style='padding:5px 0; font-weight:bold; color:#ff6b35; width:100px;'>Date:</td>
                    <td style='padding:5px 0; color:#666;'>November 15, 2024</td>
                  </tr>
                  <tr>
                    <td style='padding:5px 0; font-weight:bold; color:#ff6b35;'>Time:</td>
                    <td style='padding:5px 0; color:#666;'>9:00 AM - 5:00 PM</td>
                  </tr>
                  <tr>
                    <td style='padding:5px 0; font-weight:bold; color:#ff6b35;'>Venue:</td>
                    <td style='padding:5px 0; color:#666;'>Grand Convention Center, Downtown</td>
                  </tr>
                  <tr>
                    <td style='padding:5px 0; font-weight:bold; color:#ff6b35;'>Dress Code:</td>
                    <td style='padding:5px 0; color:#666;'>Business Professional</td>
                  </tr>
                </table>
              </div>
              
              <h3 style='color:#ff6b35; font-size:18px; margin:25px 0 15px;'>What to Expect</h3>
              <ul style='font-size:16px; line-height:1.6; color:#666; margin-bottom:25px;'>
                <li style='margin-bottom:8px;'>Keynote presentations from industry leaders</li>
                <li style='margin-bottom:8px;'>Interactive workshops and breakout sessions</li>
                <li style='margin-bottom:8px;'>Networking opportunities with peers</li>
                <li style='margin-bottom:8px;'>Complimentary lunch and refreshments</li>
                <li style='margin-bottom:8px;'>Take-home resources and materials</li>
              </ul>
              
              <div style='text-align:center; margin:30px 0;'>
                <a href='#' style='background:#ff6b35; color:#ffffff; padding:15px 30px; border-radius:6px; text-decoration:none; font-weight:bold; display:inline-block; margin:0 10px 10px 0;'>Reserve Your Spot</a>
                <a href='#' style='background:transparent; color:#ff6b35; padding:15px 30px; border:2px solid #ff6b35; border-radius:6px; text-decoration:none; font-weight:bold; display:inline-block;'>Learn More</a>
              </div>
              
              <div style='background:#f8f9fa; padding:20px; border-radius:8px; margin:25px 0;'>
                <p style='font-size:14px; line-height:1.5; color:#666; margin:0; text-align:center;'>
                  <strong>Limited Seats Available!</strong><br>
                  This exclusive event has limited capacity. Register early to secure your spot.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style='background:#f8f9fa; padding:20px; text-align:center; font-size:12px; color:#777;'>
              <p style='margin:0;'>Questions? Contact us at events@company.com or call (555) 123-4567</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    id: "product-announcement",
    name: "Product Announcement",
    category: "product",
    thumbnail: "/images/templates/product-announcement.jpg",
    description: "Showcase new products and features to your audience.",
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset='UTF-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <title>New Product Launch</title>
</head>
<body style='margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;'>
  <table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color:#f4f4f4; padding:20px;'>
    <tr>
      <td align='center'>
        <table width='600' border='0' cellspacing='0' cellpadding='0' style='background:#ffffff; border-radius:8px; overflow:hidden;'>
          <tr>
            <td style='background:#17a2b8; padding:30px; text-align:center;'>
              <h1 style='color:#ffffff; font-size:28px; margin:0;'>New Product Launch</h1>
              <p style='color:#ffffff; font-size:16px; margin:10px 0 0;'>Introducing our latest innovation</p>
            </td>
          </tr>
          <tr>
            <td style='padding:30px; text-align:left; color:#333;'>
              <h2 style='color:#17a2b8; font-size:24px; margin:0 0 20px;'>Meet ProductX Pro - The Future is Here</h2>
              <p style='font-size:16px; line-height:1.6; margin-bottom:25px;'>After months of development and testing, we're thrilled to introduce ProductX Pro - our most advanced solution yet. Designed with your needs in mind, it combines cutting-edge technology with intuitive design.</p>
              
              <div style='background:#e8f6f8; padding:25px; border-radius:8px; margin:25px 0; border-left:4px solid #17a2b8;'>
                <h3 style='color:#17a2b8; font-size:20px; margin:0 0 15px;'>Key Features</h3>
                <ul style='font-size:16px; line-height:1.6; color:#666; margin:0; padding-left:20px;'>
                  <li style='margin-bottom:10px;'>Advanced AI-powered analytics</li>
                  <li style='margin-bottom:10px;'>Real-time collaboration tools</li>
                  <li style='margin-bottom:10px;'>Enhanced security protocols</li>
                  <li style='margin-bottom:10px;'>Seamless third-party integrations</li>
                  <li style='margin-bottom:10px;'>Mobile-first responsive design</li>
                </ul>
              </div>
              
              <h3 style='color:#17a2b8; font-size:20px; margin:25px 0 15px;'>What Makes It Special?</h3>
              
              <table style='width:100%; margin:20px 0;'>
                <tr>
                  <td style='width:50%; padding:15px; vertical-align:top;'>
                    <div style='background:#f8f9fa; padding:20px; border-radius:8px; height:100px;'>
                      <h4 style='color:#17a2b8; font-size:16px; margin:0 0 10px;'>🚀 Performance</h4>
                      <p style='font-size:14px; color:#666; margin:0; line-height:1.5;'>3x faster processing speed with optimized algorithms</p>
                    </div>
                  </td>
                  <td style='width:50%; padding:15px; vertical-align:top;'>
                    <div style='background:#f8f9fa; padding:20px; border-radius:8px; height:100px;'>
                      <h4 style='color:#17a2b8; font-size:16px; margin:0 0 10px;'>🔒 Security</h4>
                      <p style='font-size:14px; color:#666; margin:0; line-height:1.5;'>Enterprise-grade encryption and compliance ready</p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style='width:50%; padding:15px; vertical-align:top;'>
                    <div style='background:#f8f9fa; padding:20px; border-radius:8px; height:100px;'>
                      <h4 style='color:#17a2b8; font-size:16px; margin:0 0 10px;'>⚡ Efficiency</h4>
                      <p style='font-size:14px; color:#666; margin:0; line-height:1.5;'>Streamlined workflows that save you time</p>
                    </div>
                  </td>
                  <td style='width:50%; padding:15px; vertical-align:top;'>
                    <div style='background:#f8f9fa; padding:20px; border-radius:8px; height:100px;'>
                      <h4 style='color:#17a2b8; font-size:16px; margin:0 0 10px;'>🎯 Precision</h4>
                      <p style='font-size:14px; color:#666; margin:0; line-height:1.5;'>AI-driven insights for better decision making</p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <div style='background:#17a2b8; color:white; padding:25px; border-radius:8px; margin:30px 0; text-align:center;'>
                <h3 style='margin:0 0 10px; font-size:20px;'>Limited Time Launch Offer</h3>
                <p style='margin:0 0 20px; font-size:16px;'>Get 30% off your first year + free setup and training</p>
                <a href='#' style='background:#ffffff; color:#17a2b8; padding:15px 30px; border-radius:6px; text-decoration:none; font-weight:bold; display:inline-block;'>Claim Your Discount</a>
              </div>
              
              <div style='text-align:center; margin:25px 0;'>
                <a href='#' style='background:#17a2b8; color:#ffffff; padding:15px 30px; border-radius:6px; text-decoration:none; font-weight:bold; display:inline-block; margin:0 10px 10px 0;'>Try Free Demo</a>
                <a href='#' style='background:transparent; color:#17a2b8; padding:15px 30px; border:2px solid #17a2b8; border-radius:6px; text-decoration:none; font-weight:bold; display:inline-block;'>View Pricing</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style='background:#f8f9fa; padding:20px; text-align:center; font-size:12px; color:#777;'>
              <p style='margin:0;'>Questions about ProductX Pro? Contact our sales team at sales@company.com</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    id: "ecommerce-reengagement",
    name: "Ecommerce Re-Engagement",
    category: "ecommerce",
    thumbnail: "/images/templates/ecommerce-reengagement.jpg",
    description: "Re-engage customers with special offers and product highlights.",
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset='UTF-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <title>Special Offer</title>
</head>
<body style='margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;'>
  <table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color:#f4f4f4; padding:20px;'>
    <tr>
      <td align='center'>
        <table width='600' border='0' cellspacing='0' cellpadding='0' style='background:#ffffff; border-radius:8px; overflow:hidden;'>
          <tr>
            <td style='background:#e74c3c; padding:30px; text-align:center;'>
              <h1 style='color:#ffffff; font-size:28px; margin:0;'>Special Offer!</h1>
              <p style='color:#ffffff; font-size:18px; margin:10px 0 0;'>Limited time only</p>
            </td>
          </tr>
          <tr>
            <td style='padding:30px; text-align:left; color:#333;'>
              <h2 style='color:#e74c3c; font-size:24px; margin:0 0 20px; text-align:center;'>We miss you!</h2>
              <p style='font-size:16px; line-height:1.6; margin-bottom:25px; text-align:center;'>It's been a while since your last visit. Come back and enjoy exclusive discounts on your favorite items plus exciting new arrivals!</p>
              
              <div style='background:#fdf2f2; padding:25px; border-radius:8px; margin:25px 0; text-align:center; border:2px dashed #e74c3c;'>
                <h3 style='color:#e74c3c; font-size:32px; margin:0 0 10px;'>50% OFF</h3>
                <p style='font-size:18px; color:#e74c3c; font-weight:bold; margin:0 0 15px;'>Everything in your wishlist</p>
                <p style='font-size:14px; color:#666; margin:0;'>Use code: <strong>COMEBACK50</strong></p>
              </div>
              
              <h3 style='color:#e74c3c; font-size:20px; margin:25px 0 15px;'>Your Personalized Picks</h3>
              
              <table style='width:100%; margin:20px 0;'>
                <tr>
                  <td style='width:33.33%; padding:10px; text-align:center;'>
                    <div style='background:#f8f9fa; padding:15px; border-radius:8px;'>
                      <div style='background:#ddd; height:120px; border-radius:8px; margin-bottom:10px;'></div>
                      <h4 style='font-size:14px; margin:0 0 5px; color:#333;'>Premium Headphones</h4>
                      <p style='font-size:12px; color:#e74c3c; margin:0; font-weight:bold;'>$149 $75</p>
                    </div>
                  </td>
                  <td style='width:33.33%; padding:10px; text-align:center;'>
                    <div style='background:#f8f9fa; padding:15px; border-radius:8px;'>
                      <div style='background:#ddd; height:120px; border-radius:8px; margin-bottom:10px;'></div>
                      <h4 style='font-size:14px; margin:0 0 5px; color:#333;'>Wireless Speaker</h4>
                      <p style='font-size:12px; color:#e74c3c; margin:0; font-weight:bold;'>$199 $99</p>
                    </div>
                  </td>
                  <td style='width:33.33%; padding:10px; text-align:center;'>
                    <div style='background:#f8f9fa; padding:15px; border-radius:8px;'>
                      <div style='background:#ddd; height:120px; border-radius:8px; margin-bottom:10px;'></div>
                      <h4 style='font-size:14px; margin:0 0 5px; color:#333;'>Smart Watch</h4>
                      <p style='font-size:12px; color:#e74c3c; margin:0; font-weight:bold;'>$299 $149</p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <div style='text-align:center; margin:30px 0;'>
                <a href='#' style='background:#e74c3c; color:#ffffff; padding:15px 30px; border-radius:6px; text-decoration:none; font-weight:bold; display:inline-block; margin:0 10px 10px 0;'>Shop Your Picks</a>
                <a href='#' style='background:transparent; color:#e74c3c; padding:15px 30px; border:2px solid #e74c3c; border-radius:6px; text-decoration:none; font-weight:bold; display:inline-block;'>Browse All Deals</a>
              </div>
              
              <div style='background:#fff5f2; padding:20px; border-radius:8px; margin:25px 0; border-left:4px solid #e74c3c;'>
                <h3 style='color:#e74c3c; font-size:16px; margin:0 0 10px;'>⏰ Hurry! Offer expires soon</h3>
                <p style='font-size:14px; color:#666; margin:0; line-height:1.5;'>This exclusive offer is valid for the next 48 hours only. Don't miss out on these incredible savings!</p>
              </div>
              
              <div style='background:#f8f9fa; padding:20px; border-radius:8px; margin:25px 0;'>
                <h3 style='color:#e74c3c; font-size:16px; margin:0 0 15px;'>Why Our Customers Love Us</h3>
                <ul style='font-size:14px; line-height:1.6; color:#666; margin:0; padding-left:20px;'>
                  <li style='margin-bottom:8px;'>Free shipping on orders over $50</li>
                  <li style='margin-bottom:8px;'>30-day money-back guarantee</li>
                  <li style='margin-bottom:8px;'>24/7 customer support</li>
                  <li style='margin-bottom:8px;'>Exclusive member discounts</li>
                </ul>
              </div>
            </td>
          </tr>
          <tr>
            <td style='background:#f8f9fa; padding:20px; text-align:center; font-size:12px; color:#777;'>
              <p style='margin:0 0 10px;'>Need help? Contact us at support@store.com or call 1-800-SHOP-NOW</p>
              <p style='margin:0;'>You're receiving this because you're a valued customer. <a href='#' style='color:#e74c3c;'>Update preferences</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
];

export const templateCategories = [
  { id: "all", name: "All Templates", count: newsletterTemplates.length },
  {
    id: "newsletter",
    name: "Newsletter",
    count: newsletterTemplates.filter((t) => t.category === "newsletter").length,
  },
  { id: "welcome", name: "Welcome", count: newsletterTemplates.filter((t) => t.category === "welcome").length },
  { id: "event", name: "Event", count: newsletterTemplates.filter((t) => t.category === "event").length },
  { id: "product", name: "Product", count: newsletterTemplates.filter((t) => t.category === "product").length },
  { id: "ecommerce", name: "Ecommerce", count: newsletterTemplates.filter((t) => t.category === "ecommerce").length },
  {
    id: "engagement",
    name: "Engagement",
    count: newsletterTemplates.filter((t) => t.category === "engagement").length,
  },
];
