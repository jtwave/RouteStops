export class RequestLimiter {
  private static MAX_PLACES = 10;

  static canMakeRequest(): boolean {
    return true; // Always allow requests
  }

  static trackRequest() {
    // No need to track requests anymore
  }

  static getMaxPlaces(): number {
    return this.MAX_PLACES;
  }
}