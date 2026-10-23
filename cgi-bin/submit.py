#!/usr/bin/env python3
import sys
import json
import os
import re
import threading
from urllib.parse import parse_qs
from datetime import datetime
BASE_DIR  = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR  = os.path.join(BASE_DIR, 'data')
DATA_FILE = os.path.join(DATA_DIR, 'submissions.txt')
MAX_BODY  = 16 * 1024
WRITE_LOCK = threading.Lock()
VALID_WEAPONS  = {'knife', 'handgun', 'shotgun', 'smg', 'rocket', 'bowgun'}
VALID_INSTINCT = {'fight', 'stealth', 'run', 'dominate'}
VALID_PRIORITY = {'protect', 'intel', 'survive', 'dominate'}
VALID_GAMES    = {'re1', 're2', 're3', 're4', 're7', 're8'}
NAME_RE     = re.compile(r"^(?:[^\W\d_]|[\s'\-]){2,60}$")
CODENAME_RE = re.compile(r"^[a-zA-Z0-9_\-\s]{2,30}$")
EMAIL_RE    = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
CHARS = {
    'wesker': {'name': 'Albert Wesker', 'role': 'Umbrella Corp. — Director / Antagonist',
               'clearance': 'CLASSIFIED', 'color': '#aaaaaa',
               'bio': 'You possess extraordinary vision and extraordinary contempt for everyone around you. '
                      'Sunglasses indoors. Prototype virus for personal gain. You see the board before '
                      'anyone else knows there\'s a game. Dangerous. Exceptional. Inevitable.'},
    'chris':  {'name': 'Chris Redfield', 'role': 'S.T.A.R.S. Alpha — Marksman / B.S.A.A.',
               'clearance': 'ALPHA', 'color': '#4a9fd4',
               'bio': 'Headstrong, loyal, physically overwhelming. You face threats head-on '
                      'and refuse to leave anyone behind. Your determination borders on recklessness — '
                      'but it keeps working. Boulder optional.'},
    'leon':   {'name': 'Leon S. Kennedy', 'role': 'U.S. Government — Field Operative',
               'clearance': 'DELTA', 'color': '#6fb56f',
               'bio': 'Composed under fire, with hair that defies physics and a philosophical '
                      'one-liner for every occasion. You were not prepared — and you survived anyway. '
                      'The President\'s daughter is safe.'},
    'claire': {'name': 'Claire Redfield', 'role': 'TerraSave — Field Investigator',
               'clearance': 'GAMMA', 'color': '#d47a40',
               'bio': 'You rode into danger looking for someone you love and left with the whole city '
                      'on your conscience. Protective, relentless, and surprisingly effective on a '
                      'motorbike through a zombie apocalypse.'},
    'jill':   {'name': 'Jill Valentine', 'role': 'S.T.A.R.S. Alpha — Field Agent / B.S.A.A.',
               'clearance': 'OMEGA', 'color': '#d465a0',
               'bio': 'Strategic, resourceful, unbreakable. You plan your way out before anyone '
                      'realises there\'s no exit. Master of unlocking. Master of survival. '
                      'Nemesis has tried — and failed.'}
}
def parse_body(body):
    parsed = parse_qs(body, keep_blank_values=True)
    return {k: (v[0] if v else '').strip() for k, v in parsed.items()}
def validate(f):
    errors = {}
    name = f.get('name', '')
    if not name:
        errors['name'] = 'This field is required.'
    elif not NAME_RE.match(name):
        errors['name'] = 'Letters, spaces, apostrophes and hyphens only. 2–60 characters.'
    codename = f.get('codename', '')
    if not codename:
        errors['codename'] = 'This field is required.'
    elif not CODENAME_RE.match(codename):
        errors['codename'] = 'Latin letters, digits, _, - and spaces only. 2–30 characters.'
    email = f.get('email', '')
    if not email:
        errors['email'] = 'This field is required.'
    elif len(email) > 100 or not EMAIL_RE.match(email):
        errors['email'] = 'Invalid email address.'
    if f.get('weapon', '') not in VALID_WEAPONS:
        errors['weapon'] = 'Select a valid weapon.'
    if f.get('instinct', '') not in VALID_INSTINCT:
        errors['instinct'] = 'Select a threat response.'
    if f.get('priority', '') not in VALID_PRIORITY:
        errors['priority'] = 'Select a priority.'
    if f.get('favGame', '') not in VALID_GAMES:
        errors['favGame'] = 'Select an incident file.'
    if len(f.get('message', '')) > 800:
        errors['message'] = 'The field report exceeds 800 characters.'
    return errors
def match_character(f):
    score = 0
    score += {'knife': -1, 'handgun': 1, 'shotgun': 2,
              'smg': 2, 'rocket': 3, 'bowgun': 0}.get(f.get('weapon', ''), 0)
    score += {'fight': 2, 'stealth': -1, 'run': 0,
              'dominate': 4}.get(f.get('instinct', ''), 0)
    score += {'protect': 1, 'intel': -1, 'survive': 0,
              'dominate': 5}.get(f.get('priority', ''), 0)
    score += {'re1': 0, 're2': 0, 're3': -1,
              're4': 1, 're7': -2, 're8': 0}.get(f.get('favGame', ''), 0)
    if score >= 9:
        return CHARS['wesker']
    if score >= 4:
        return CHARS['chris']
    if score >= 2:
        return CHARS['leon']
    if score >= 0:
        return CHARS['claire']
    return CHARS['jill']
def clean_line(value):
    return ' '.join(str(value).split())
def save_submission(f, character):
    os.makedirs(DATA_DIR, exist_ok=True)
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    sep = '─' * 60
    lines = [
        sep,
        f"TIMESTAMP   : {timestamp}",
        f"NAME        : {clean_line(f.get('name', ''))}",
        f"CODENAME    : {clean_line(f.get('codename', '')).upper()}",
        f"EMAIL       : {clean_line(f.get('email', ''))}",
        f"WEAPON      : {f.get('weapon', '')}",
        f"INSTINCT    : {f.get('instinct', '')}",
        f"PRIORITY    : {f.get('priority', '')}",
        f"FAV_GAME    : {f.get('favGame', '')}",
        f"MATCH       : {character['name']}",
        f"FIELD_REPORT: {clean_line(f.get('message', '')) or '—'}",
        sep,
        ""
    ]
    with WRITE_LOCK:
        with open(DATA_FILE, 'a', encoding='utf-8') as fh:
            fh.write('\n'.join(lines) + '\n')
def process(body):
    try:
        fields = parse_body(body)
        errors = validate(fields)
        if errors:
            return {'success': False, 'errors': errors}
        character = match_character(fields)
        save_submission(fields, character)
        return {
            'success':   True,
            'character': character,
            'codename':  fields.get('codename', '').upper(),
            'message':   fields.get('message', '')
        }
    except Exception as e:
        return {'success': False, 'errors': {'server': str(e)}}
def main():
    method = os.environ.get('REQUEST_METHOD', 'GET').upper()
    if method != 'POST':
        result = {'success': False, 'errors': {'server': 'Only POST requests are accepted.'}}
    else:
        try:
            length = min(int(os.environ.get('CONTENT_LENGTH', 0) or 0), MAX_BODY)
        except ValueError:
            length = 0
        body = sys.stdin.buffer.read(length).decode('utf-8', errors='replace')
        result = process(body)
    payload = json.dumps(result, ensure_ascii=False).encode('utf-8')
    out = sys.stdout.buffer
    out.write(b"Content-Type: application/json; charset=utf-8\r\n")
    out.write(b"Content-Length: " + str(len(payload)).encode() + b"\r\n\r\n")
    out.write(payload)
    out.flush()
if __name__ == '__main__':
    main()
