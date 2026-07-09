//@ts-ignore
const BlockInput = {
    STRING: "string",
    NUMBER: "number"
};

export default class RobotKMotorKit {
    
    // 1. Khối lệnh Tiến / Lùi theo số cm mong muốn
    move_distance(args: any, generator: any) {
        const dir = args.DIR;
        const dist = generator.valueToCode(args, 'DIST', generator.ORDER_ATOMIC);
        const speed = generator.valueToCode(args, 'SPEED', generator.ORDER_ATOMIC);
        
        // Khởi tạo các chân motor theo hàm cauhinh() của kMotor
        generator.addSetup('kmotor_init', `pinMode(3, OUTPUT);\n  pinMode(6, OUTPUT);\n  pinMode(8, OUTPUT);\n  pinMode(7, OUTPUT);`);
        
        // Công thức quy đổi ước lượng: Giả sử ở tốc độ trung bình, robot chạy 1cm mất khoảng 30 mili-giây.
        // Thời gian delay = số cm * (khối lượng quy đổi dựa theo tốc độ thực tế).
        const delayTime = `((${dist}) * (3000.0 / ${speed}))`; 

        let motorCode = "";
        if (dir === 'TIEN') {
            // Thiết lập chân chạy Tiến theo hàm run(0, b) của kmotor
            motorCode = `digitalWrite(7, 1); analogWrite(6, ${speed});\ndigitalWrite(8, 1); analogWrite(3, ${speed});\n`;
        } else if (dir === 'LUI') {
            // Thiết lập chân chạy Lùi theo hàm run(1, b) của kmotor
            motorCode = `digitalWrite(7, 0); analogWrite(6, ${speed});\ndigitalWrite(8, 0); analogWrite(3, ${speed});\n`;
        }

        // Sau khi chạy hết thời gian delay tương ứng số cm, robot tự động thực hiện hàm stop()
        return motorCode + 
               `delay(${delayTime});\n` + 
               `digitalWrite(7, 1); analogWrite(6, 0); // Tự động dừng xe\n` +
               `digitalWrite(8, 1); analogWrite(3, 0);\n`;
    }

    // 2. Khối lệnh Rẽ Trái / Rẽ Phải theo số góc độ (Degree)
    turn_degree(args: any, generator: any) {
        const dir = args.DIR;
        const deg = generator.valueToCode(args, 'DEG', generator.ORDER_ATOMIC);
        const speed = generator.valueToCode(args, 'SPEED', generator.ORDER_ATOMIC);
        
        generator.addSetup('kmotor_init', `pinMode(3, OUTPUT);\n  pinMode(6, OUTPUT);\n  pinMode(8, OUTPUT);\n  pinMode(7, OUTPUT);`);
        
        // Công thức quy đổi ước lượng góc quay: Giả sử quay 1 độ mất khoảng 7 mili-giây ở tốc độ chuẩn.
        const delayTime = `((${deg}) * (1000.0 / ${speed}) * 7.0)`;

        let motorCode = "";
        if (dir === 'TRAI') {
            // Thiết lập chân Xoay Trái theo hàm run(2, b) của kmotor
            motorCode = `digitalWrite(7, 0); analogWrite(6, ${speed});\ndigitalWrite(8, 1); analogWrite(3, ${speed});\n`;
        } else if (dir === 'PHAI') {
            // Thiết lập chân Xoay Phải theo hàm run(3, b) của kmotor
            motorCode = `digitalWrite(7, 1); analogWrite(6, ${speed});\ndigitalWrite(8, 0); analogWrite(3, ${speed});\n`;
        }

        return motorCode + 
               `delay(${delayTime});\n` + 
               `digitalWrite(7, 1); analogWrite(6, 0); // Tự động dừng xe\n` +
               `digitalWrite(8, 1); analogWrite(3, 0);\n`;
    }

    // 3. Khối lệnh Dừng lại lập tức
    control_stop(args: any, generator: any) {
        return `digitalWrite(7, 1); analogWrite(6, 0);\ndigitalWrite(8, 1); analogWrite(3, 0);\n`;
    }

    // 4. Khối lệnh đọc cảm biến Siêu âm
    read_ultrasonic(args: any, generator: any) {
        const trig = args.TRIG;
        const echo = args.ECHO;
        
        generator.addInclude('ultrasonic_function', `
float getDistance(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW); delayMicroseconds(2);
  digitalWrite(trigPin, HIGH); delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  long duration = pulseIn(echoPin, HIGH, 25000);
  if (duration == 0) return 400.0;
  return duration * 0.0343 / 2;
}`);
        generator.addSetup(`init_ultra_${trig}_${echo}`, `pinMode(${trig}, OUTPUT);\n  pinMode(${echo}, INPUT);`);
        return [`getDistance(${trig}, ${echo})`, generator.ORDER_ATOMIC];
    }

    // 5. Khối lệnh mắt đọc dò Line hồng ngoại
    read_line(args: any, generator: any) {
        const pin = args.PIN;
        generator.addSetup(`init_line_${pin}`, `pinMode(${pin}, INPUT);`);
        return [`(digitalRead(${pin}) == LOW)`, generator.ORDER_ATOMIC];
    }
}
