
import {
  buildShape,
  Image,
  Math2,
  Shape,
  BoundingBox,
} from "@owlbear-rodeo/sdk";

interface Rectangle extends Shape {
  shapeType: "RECTANGLE";
}

function deg2rad(degree: number) {
  return (degree / 180) * Math.PI;
}


function isRectangle(shape: Shape): shape is Rectangle {
  return shape.shapeType === "RECTANGLE";
}

function getRectangleBoundingBox(rectangle: Rectangle) {
  const radians = deg2rad(rectangle.rotation);
  const sin = Math.sin(radians);
  const cos = Math.cos(radians);

  const rX = (rectangle.width / 2) * rectangle.scale.x;
  const rY = (rectangle.height / 2) * rectangle.scale.y;

  const center = {
    x: rectangle.position.x + rX * cos - rY * sin,
    y: rectangle.position.y + rY * cos + rX * sin,
  };

  const corners = [
    {
      x: center.x - rX * cos + rY * sin,
      y: center.y - rX * sin - rY * cos,
    },
    {
      x: center.x + rX * cos + rY * sin,
      y: center.y + rX * sin - rY * cos,
    },
    {
      x: center.x + rX * cos - rY * sin,
      y: center.y + rX * sin + rY * cos,
    },
    {
      x: center.x - rX * cos - rY * sin,
      y: center.y - rX * sin + rY * cos,
    },
  ];

  return Math2.boundingBox(corners);
}

export function getImageBoundingBox(image: Image) {
  if (!image.grid) return;

  const scaleDpi = 150 / image.grid.dpi;
  const scaleX = scaleDpi * image.scale.x;
  const scaleY = scaleDpi * image.scale.y;

  const offsetX = image.grid.offset.x * scaleX;
  const offsetY = image.grid.offset.y * scaleY;

  const radians = deg2rad(image.rotation);
  const sin = Math.sin(radians);
  const cos = Math.cos(radians);

  const rectangle = buildShape()
    .shapeType("RECTANGLE")
    .rotation(image.rotation)
    .width(image.image.width)
    .height(image.image.height)
    .scale({
      x: scaleX,
      y: scaleY,
    })
    .position({
      x: image.position.x - offsetX * cos + offsetY * sin,
      y: image.position.y - offsetY * cos - offsetX * sin,
    })
    .build();

  if (isRectangle(rectangle)) {
    return getRectangleBoundingBox(rectangle);
  }

  throw `shape doesn't look like a rectangle`;
}

export function intersect(a: BoundingBox, b: BoundingBox): boolean {
  return !(
    a.max.x < b.min.x ||    // a is completely left  of b
    a.min.x > b.max.x ||    // a is completely right of b
    a.max.y < b.min.y ||    // a is completely above b
    a.min.y > b.max.y       // a is completely below b
  );
}
