import React, { useState } from 'react';
import Delaunator from 'delaunator';

function ImageTessellation()  {
    const [imageUrl, setImageUrl] = useState('');
    const canvasRef = React.useRef(null);
    const [passabilityMatrix, setPassabilityMatrix] = useState([]);


    const handleImageChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            setImageUrl(e.target.result);
        };

        reader.readAsDataURL(file);
    };

    const performTessellation = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const image = new Image();
        const width = document.getElementById('width').value
        const height = document.getElementById('height').value

        image.onload = function () {
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(image, 0, 0);

            // const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const points = [];

            // заполняю точки
            for (let y = 0; y < canvas.height; y += 15) {
                for (let x = 0; x < canvas.width; x += 15) {
                    points.push([x, y]);
                }
            }
            //точка в треугольнике
            function isPointInTriangle(px, py, p0, p1, p2) {
                const dX = px - p2[0];
                const dY = py - p2[1];
                const dX21 = p2[0] - p1[0];
                const dY12 = p1[1] - p2[1];
                const d = dY12 * (p0[0] - p2[0]) + dX21 * (p0[1] - p2[1]);
                const s = dY12 * dX + dX21 * dY;
                const t = (p2[1] - p0[1]) * dX + (p0[0] - p2[0]) * dY;

                if (d < 0) return s <= 0 && t <= 0 && s + t >= d;
                return s >= 0 && t >= 0 && s + t <= d;
            }
            const triangulation = Delaunator.from(points);
            const triangles = triangulation.triangles;
            console.log(triangles)

            // рисую сетку
            ctx.strokeStyle = 'red';
            ctx.beginPath();
            for (let i = 0; i < triangles.length; i += 3) {

                const p1 = points[triangles[i]];
                const p2 = points[triangles[i + 1]];
                const p3 = points[triangles[i + 2]];

                ctx.moveTo(p1[0], p1[1]);
                ctx.lineTo(p2[0], p2[1]);
                ctx.lineTo(p3[0], p3[1]);
                ctx.lineTo(p1[0], p1[1]);
                ctx.stroke()

                const trianglePassability = [];

                for (let y = 0; y < canvas.height; y += 20) {
                    for (let x = 0; x < canvas.width; x += 20) {
                        // Проверка проходимости пикселя внутри треугольника
                        if (isPointInTriangle(x, y, p1, p2, p3)) {
                            const pixelData = ctx.getImageData(x, y, 1, 1).data;

                            // Пример: Проверка на черный цвет (0, 0, 0) как непроходимость
                            const isPassable = !(pixelData[0] === 0 && pixelData[1] === 0 && pixelData[2] === 0);
                            trianglePassability.push((isPassable) ? 1 : 0);
                        }
                    }
                }
                passabilityMatrix.push(trianglePassability);
            }
            setPassabilityMatrix(passabilityMatrix);
            console.log(passabilityMatrix)

        }
        image.src = imageUrl;
    }

    return (
        <div>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            <button onClick={performTessellation}>Треугольная тесселяция</button>
            <canvas ref={canvasRef}/>
            <p> Ширина: <input type="text" id = 'width' /> </p>
            <p> Высота: <input type="text" id = 'height' /> </p>

            {/*<h3>Матрица проходимости:</h3>*/}
            {/*<table>*/}
            {/*    <tbody>*/}
            {/*    {passabilityMatrix.map((row, rowIndex) => (*/}
            {/*        <tr key={rowIndex}>*/}
            {/*            {row.map((cell, cellIndex) => (*/}
            {/*                <td key={cellIndex}>{cell}</td>*/}
            {/*            ))}*/}
            {/*        </tr>*/}
            {/*    ))}*/}
            {/*    </tbody>*/}
            {/*</table>*/}

        </div>
    )

}

export default ImageTessellation;
