// ระบบ High Score (บันทึกลงเครื่องผู้เล่นผ่าน localStorage)
const HighScore = {
    KEY: 'starCollector_highScore',

    get() {
        const value = parseInt(localStorage.getItem(this.KEY), 10);
        return Number.isNaN(value) ? 0 : value;
    },

    // บันทึกคะแนนถ้าสูงกว่าเดิม คืนค่า true ถ้าทำสถิติใหม่
    submit(score) {
        const current = this.get();
        if (score > current) {
            localStorage.setItem(this.KEY, String(score));
            return true;
        }
        return false;
    }
};
