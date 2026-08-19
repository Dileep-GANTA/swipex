from fastapi import APIRouter, Depends
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app import models

router = APIRouter(tags=["Database Viewer"])

@router.get("/db", response_class=HTMLResponse)
@router.get("/database", response_class=HTMLResponse)
def view_database(db: Session = Depends(get_db)):
    """
    Renders an interactive, responsive HTML Database Inspector for all PostgreSQL tables and rows.
    Shows User Emails instead of User IDs and Job Names instead of Job IDs.
    """
    users = db.query(models.User).all()
    jobs = db.query(models.Job).all()
    applications = db.query(models.Application).all()
    swipes = db.query(models.SwipeHistory).all()
    saved = db.query(models.SavedJob).all()
    companies = db.query(models.Company).all()

    # Create Lookup Dictionaries
    user_map = {u.id: u for u in users}
    job_map = {j.id: j for j in jobs}

    # Format Applications rows
    app_rows_html = []
    for a in applications:
        u = user_map.get(a.user_id)
        j = job_map.get(a.job_id)
        user_email = u.email if u else f"User #{a.user_id}"
        job_name = f"{j.title} @ {j.company_name}" if j else f"Job #{a.job_id}"
        
        app_rows_html.append(f"""
        <tr>
            <td><b>#{a.id}</b></td>
            <td><b style="color: #38bdf8;">{user_email}</b></td>
            <td><b style="color: #f43f5e;">{job_name}</b></td>
            <td><b style="color: #10b981;">{a.matching_score}%</b></td>
            <td><span class="tag tag-seeker">{a.status}</span></td>
            <td>{a.applied_at}</td>
        </tr>
        """)

    # Format Jobs rows
    job_rows_html = []
    for j in jobs:
        r = user_map.get(j.recruiter_id)
        recruiter_email = r.email if r else "recruiter@swipex.com"
        company_badge_class = 'tag-mnc' if 'not a startup' in (j.company_type or '').lower() else 'tag-startup'

        job_rows_html.append(f"""
        <tr>
            <td><b>#{j.id}</b></td>
            <td><b style="color: #38bdf8;">{j.title}</b></td>
            <td>{j.company_name or '-'}</td>
            <td><span class="tag {company_badge_class}">{j.company_type or 'Startup'}</span></td>
            <td>{j.location or '-'}</td>
            <td>{j.salary or '-'}</td>
            <td><b style="color: #a855f7;">{recruiter_email}</b></td>
        </tr>
        """)

    # Format Saved Jobs rows
    saved_rows_html = []
    for s in saved:
        u = user_map.get(s.user_id)
        j = job_map.get(s.job_id)
        u_email = u.email if u else f"User #{s.user_id}"
        j_name = f"{j.title} @ {j.company_name}" if j else f"Job #{s.job_id}"
        saved_rows_html.append(f"""
        <tr>
            <td><b>#{s.id}</b></td>
            <td><b style="color: #38bdf8;">{u_email}</b></td>
            <td><b style="color: #f43f5e;">{j_name}</b></td>
            <td>{s.saved_at}</td>
        </tr>
        """)

    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SwipeX Live PostgreSQL Database Inspector 🐘</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>
            body {{
                font-family: 'Inter', sans-serif;
                background-color: #0f172a;
                color: #f8fafc;
                margin: 0;
                padding: 30px;
            }}
            .header {{
                background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                padding: 24px 32px;
                border-radius: 16px;
                margin-bottom: 24px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }}
            h1 {{ margin: 0; font-size: 24px; font-weight: 800; color: #38bdf8; }}
            .badge {{
                background: #0284c7;
                color: #fff;
                padding: 6px 14px;
                border-radius: 20px;
                font-size: 13px;
                font-weight: 700;
            }}
            .section {{
                background: #1e293b;
                border-radius: 16px;
                padding: 24px;
                margin-bottom: 24px;
                border: 1px solid #334155;
            }}
            h2 {{ font-size: 18px; margin-top: 0; color: #f1f5f9; border-bottom: 2px solid #334155; padding-bottom: 10px; }}
            table {{
                width: 100%;
                border-collapse: collapse;
                margin-top: 14px;
                font-size: 14px;
            }}
            th, td {{
                padding: 12px 14px;
                text-align: left;
                border-bottom: 1px solid #334155;
            }}
            th {{ background: #0f172a; color: #94a3b8; font-weight: 700; text-transform: uppercase; font-size: 12px; }}
            tr:hover {{ background: #283548; }}
            .tag {{
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 700;
            }}
            .tag-recruiter {{ background: #7c3aed; color: #fff; }}
            .tag-seeker {{ background: #059669; color: #fff; }}
            .tag-mnc {{ background: #2563eb; color: #fff; }}
            .tag-startup {{ background: #d97706; color: #fff; }}
        </style>
    </head>
    <body>
        <div class="header">
            <div>
                <h1>🐘 SwipeX Live PostgreSQL Database Inspector</h1>
                <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 14px;">
                    Connection URI: <code>postgresql://postgres:vikkihema@localhost:5432/swipex</code>
                </p>
            </div>
            <div class="badge">User Email & Job Name Mode Active</div>
        </div>

        <!-- APPLICATIONS TABLE -->
        <div class="section">
            <h2>📄 Candidate Applications Table ({len(applications)} Records)</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>USER EMAIL</th>
                        <th>JOB NAME</th>
                        <th>MATCHING SCORE</th>
                        <th>STATUS</th>
                        <th>APPLIED AT</th>
                    </tr>
                </thead>
                <tbody>
                    {''.join(app_rows_html)}
                </tbody>
            </table>
        </div>

        <!-- JOBS TABLE -->
        <div class="section">
            <h2>💼 Jobs Schema Table ({len(jobs)} Records)</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>JOB TITLE</th>
                        <th>COMPANY NAME</th>
                        <th>CLASSIFICATION</th>
                        <th>LOCATION</th>
                        <th>SALARY</th>
                        <th>RECRUITER EMAIL</th>
                    </tr>
                </thead>
                <tbody>
                    {''.join(job_rows_html)}
                </tbody>
            </table>
        </div>

        <!-- USERS TABLE -->
        <div class="section">
            <h2>👥 Users Schema Table ({len(users)} Records)</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>User Email</th>
                        <th>Full Name</th>
                        <th>Role</th>
                        <th>Created At</th>
                    </tr>
                </thead>
                <tbody>
                    {''.join([f"""
                    <tr>
                        <td><b>#{u.id}</b></td>
                        <td>{u.username}</td>
                        <td><b style="color: #38bdf8;">{u.email}</b></td>
                        <td>{u.full_name or '-'}</td>
                        <td><span class="tag {'tag-recruiter' if u.role == 'Recruiter' else 'tag-seeker'}">{u.role}</span></td>
                        <td>{u.created_at}</td>
                    </tr>
                    """ for u in users])}
                </tbody>
            </table>
        </div>

        <!-- SAVED JOBS TABLE -->
        <div class="section">
            <h2>♥ Saved Jobs Table ({len(saved)} Records)</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>USER EMAIL</th>
                        <th>JOB NAME</th>
                        <th>SAVED AT</th>
                    </tr>
                </thead>
                <tbody>
                    {''.join(saved_rows_html)}
                </tbody>
            </table>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content, status_code=200)
