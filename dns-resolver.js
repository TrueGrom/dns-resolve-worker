const { Resolver } = require("dns").promises;

class DnsResolver extends Resolver {
  static get Records() {
    return {
      A: "A",
      AAAA: "AAAA",
      ANY: "ANY",
      CNAME: "CNAME",
      MX: "MX",
      NAPTR: "NAPTR",
      NS: "NS",
      PTR: "PTR",
      SOA: "SOA",
      SRV: "SRV",
      TXT: "TXT"
    };
  }

  static hasRecord(type) {
    return DnsResolver.Records.hasOwnProperty(type.toUpperCase());
  }

  constructor(dnsServers) {
    super();
    this.setServers(dnsServers);
  }

  resolveByType(type, hostname) {
    if (type === DnsResolver.Records.A) {
      return this.resolve4(hostname);
    }
    if (type === DnsResolver.Records.AAAA) {
      return this.resolve6(hostname);
    }
    if (type === DnsResolver.Records.ANY) {
      return this.resolveAny(hostname);
    }
    if (type === DnsResolver.Records.CNAME) {
      return this.resolveCname(hostname);
    }
    if (type === DnsResolver.Records.MX) {
      return this.resolveMx(hostname);
    }
    if (type === DnsResolver.Records.NAPTR) {
      return this.resolveNaptr(hostname);
    }
    if (type === DnsResolver.Records.NS) {
      return this.resolveNs(hostname);
    }
    if (type === DnsResolver.Records.PTR) {
      return this.resolvePtr(hostname);
    }
    if (type === DnsResolver.Records.SOA) {
      return this.resolveSoa(hostname);
    }
    if (type === DnsResolver.Records.SRV) {
      return this.resolveSrv(hostname);
    }
    if (type === DnsResolver.Records.TXT) {
      return this.resolveTxt(hostname);
    }
  }
}

module.exports = DnsResolver;
