from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).parent / "assets"
FONT = "C:/Windows/Fonts/malgun.ttf"
BOLD = "C:/Windows/Fonts/malgunbd.ttf"


def f(size, bold=False):
    return ImageFont.truetype(BOLD if bold else FONT, size)


def rr(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def solution_flow():
    w, h = 980, 980
    im = Image.new("RGB", (w, h), "#F8FAFC")
    d = ImageDraw.Draw(im)
    rr(d, (36, 36, w - 36, h - 36), 26, "#FFFFFF", "#D8E0EA", 2)
    rr(d, (62, 62, w - 62, 112), 18, "#0F172A")
    for x, c in [(88, "#EF4444"), (116, "#F4C542"), (144, "#10B981")]:
        d.ellipse((x, 80, x + 14, 94), fill=c)
    d.text((680, 76), "보험의 기준 LAB", font=f(18, True), fill="#CBD5E1")

    rr(d, (82, 146, w - 82, 420), 22, "#10264E")
    d.text((120, 190), "상담의 모든 과정,", font=f(50, True), fill="#FFFFFF")
    d.text((120, 254), "한 곳에서 정리합니다.", font=f(50, True), fill="#FFFFFF")
    d.text((122, 334), "자료 확인부터 고객 설명, 후속 안내, 브랜딩까지", font=f(23), fill="#D7E3F6")
    rr(d, (690, 194, 842, 244), 25, "#F4C542")
    d.text((720, 205), "무료 확인", font=f(18, True), fill="#0F172A")

    items = [
        ("01", "자료 확인", "상담 전 필요한 자료를 빠르게 찾습니다."),
        ("02", "설명 흐름", "고객이 이해할 순서로 정리합니다."),
        ("03", "후속 안내", "서류와 전달 자료를 관리합니다."),
        ("04", "브랜딩", "카페와 강의로 신뢰를 쌓습니다."),
    ]
    y = 470
    for i, (num, title, desc) in enumerate(items):
        x = 82 + (i % 2) * 408
        yy = y + (i // 2) * 178
        rr(d, (x, yy, x + 374, yy + 138), 18, "#FFFFFF", "#D8E0EA", 2)
        rr(d, (x + 24, yy + 24, x + 74, yy + 74), 14, "#EFF6FF", "#BFDBFE")
        d.text((x + 37, yy + 33), num, font=f(19, True), fill="#2563EB")
        d.text((x + 96, yy + 28), title, font=f(25, True), fill="#0F172A")
        d.text((x + 96, yy + 70), desc, font=f(17), fill="#475569")

    rr(d, (82, 842, w - 82, 908), 18, "#EFF6FF", "#BFDBFE", 2)
    d.text((122, 859), "반복 업무를 줄이고, 설명 품질을 높이는 실무형 시스템", font=f(24, True), fill="#0F172A")
    im.save(OUT / "solution-flow.png", quality=95)


def exam_center():
    w, h = 1200, 780
    im = Image.new("RGB", (w, h), "#0F1B2D")
    d = ImageDraw.Draw(im)
    rr(d, (0, 0, w, 210), 0, "#102033")
    rr(d, (560, 28, 640, 56), 6, "#D5AA4B")
    d.text((584, 33), "MRSG", font=f(15, True), fill="#0F172A")
    d.text((450, 82), "보험모집인 자격시험", font=f(34, True), fill="#FFFFFF")
    d.text((493, 128), "모의고사 센터", font=f(34, True), fill="#FFFFFF")
    d.text((430, 174), "생명보험 · 손해보험 · 변액보험 · 퇴직연금", font=f(17), fill="#8FB3E8")

    stats = [("4", "자격시험 종류"), ("40", "총 모의고사 회차"), ("1,600+", "총 문항 수"), ("4", "기출 요약집")]
    for i, (num, label) in enumerate(stats):
        x = 330 + i * 155
        d.text((x, 230), num, font=f(31, True), fill="#F4C542")
        d.text((x - 18, 270), label, font=f(14), fill="#86A3C7")

    rr(d, (330, 318, 870, 362), 9, "#172B46", "#28405F")
    d.text((352, 328), "시험명, 회차로 검색...  (예: 생명보험, 3회)", font=f(17), fill="#AFC4E1")

    filters = ["전체", "생명보험", "손해보험", "변액보험", "퇴직연금"]
    for i, label in enumerate(filters):
        x = 400 + i * 105
        fill = "#F0C562" if i == 0 else "#12243B"
        txt = "#0F172A" if i == 0 else "#B9CAE2"
        rr(d, (x, 400, x + 82, 435), 17, fill, "#294462")
        d.text((x + 22, 408), label, font=f(13, True), fill=txt)

    rr(d, (90, 462, 1110, 510), 10, "#14243A", "#334B68")
    d.text((130, 476), "각 과목 카드를 클릭하면 모의고사와 요약집을 선택할 수 있습니다.", font=f(16), fill="#B9CAE2")

    rr(d, (90, 535, 1110, 735), 14, "#172B46", "#2B4565")
    rr(d, (116, 562, 162, 608), 13, "#B67A2D")
    d.text((182, 556), "퇴직연금 모집인", font=f(25, True), fill="#FFFFFF")
    d.text((182, 594), "근로자퇴직급여 보장법 · 퇴직연금 모집인 준수사항", font=f(15), fill="#9DB7D8")
    rr(d, (116, 642, 1084, 650), 4, "#F4C542")

    cards = ["기출 요약집", "제1~3회 모의고사", "제4~6회 모의고사", "제7~8회 모의고사", "제9~10회 모의고사"]
    for i, label in enumerate(cards):
        x = 116 + i * 190
        rr(d, (x, 672, x + 170, 718), 8, "#213A5B", "#385A81")
        d.text((x + 14, 684), label, font=f(14, True), fill="#FFFFFF")
    im.save(OUT / "exam-center.png", quality=95)


solution_flow()
exam_center()
