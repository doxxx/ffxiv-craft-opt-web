function Crafter(cls, level, craftsmanship, control, craftPoints, specialist, actions) {
  this.cls = cls;
  this.craftsmanship = craftsmanship;
  this.control = control;
  this.craftPoints = craftPoints;
  this.level = level;
  this.specialist = specialist;
  if (actions === null) {
    this.actions = [];
  }
  else {
    this.actions = actions;
  }
}
